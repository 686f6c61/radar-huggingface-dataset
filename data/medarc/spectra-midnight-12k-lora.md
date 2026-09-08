# medarc/spectra-midnight-12k-lora

## Resumen

MedARC ha publicado `medarc/spectra-midnight-12k-lora`, un adaptador LoRA de rango 32 para el modelo de fundación de patología `kaiko-ai/midnight`. El adaptador se entrena de forma contrastiva sobre tiles de histopatología registrados procedentes de PLISM, donde la misma región física de tejido se captura bajo múltiples condiciones de escáner, tinción y centro. El objetivo es que las representaciones de una misma localización converjan mientras que las de tiles distintos se separen, haciendo al modelo base más robusto frente a las variaciones de adquisición que tanto afectan a la patología computacional.

La solución no modifica los pesos del modelo base; solo aprende un delta LoRA en las proyecciones de atención y MLP (240 módulos en total, 6 por bloque en 40 bloques). La dimensión de embedding final es 3072, obtenida concatenando el token CLS con la media de los 256 tokens espaciales. El adaptador es de tamaño reducido (0.4 GB) y está liberado bajo licencia MIT. Se ofrecen tres semillas de entrenamiento independientes, sin empaquetar como ensemble.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de visión (modelo base kaiko-ai/midnight) + LoRA r=32; 40 bloques, embed_dim 1536, 256 tokens espaciales |
| Parametros totales | No disponible (adaptador LoRA de 0.4 GB; modelo base no especificado) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible (modelo de visión a 224x224; no aplica a texto) |
| Tipos de cuantizacion | No disponible (los pesos del adaptador se liberan en fp32) |
| Idiomas soportados | No disponible (modelo de visión; no aplica a texto) |
| Licencia | MIT (adaptador) |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `kaiko-ai/midnight`, fijado a la revisión `adc6b15679c981cce6f9b018bbad09d16eeeda9f`. La FFN del modelo base es SwiGLU, por lo que los módulos adaptados son `mlp.weights_in` y `mlp.weights_out`, no `fc1`/`fc2`. El entrenamiento utiliza LoRA (PEFT 0.20.0) con r=32, alpha=64 (escala 2.0), dropout 0.0 y bias `none`. La pérdida es InfoNCE sobre tiles PLISM registrados, con cabezas separadas para CLS y media de tokens (pesos 0.5/0.5), temperatura 0.07.

El régimen de entrenamiento consta de 500 pasos totales con 200 de warmup, learning rate 1e-4 y weight decay 0.05. La selección de checkpoint se realiza por la regla 1-SE sobre la curva del índice de robustez PathoROB, aplicada por semilla. Como los pasos seleccionados caen dentro del warmup, los checkpoints liberados están sin recocido (un-annealed). Los proyectores contrastivos y la cabeza de pooling usados durante el entrenamiento no se han publicado, ya que eran solo mecanismos internos.

## Capacidades

- Extracción de características de tiles histopatológicos de 224x224, con embeddings de dimensión 3072 (CLS + media de parches).
- Robustez mejorada frente a cambios de escáner, tinción y centro, gracias al entrenamiento contrastivo sobre PLISM.
- Recuperación de imágenes por similitud (retrieval) entre diferentes condiciones de adquisición.
- Aprendizaje por transferencia: sirve como backbone para clasificadores o modelos predictivos aguas abajo.
- Compatibilidad con pipelines de patología computacional que requieren invariancia a variaciones pre-analíticas.
- No es un modelo generativo ni de texto; carece de soporte de tool calling, agentes o capacidades multilingües.

## Casos de uso

- Búsqueda de casos similares entre centros: los embeddings robustos permiten recuperar tiles histopatológicos parecidos aunque provengan de escáneres o tinciones distintas, útil para consultas de archivos digitales multicéntricos.
- Clasificación de subtipos tumorales: se pueden entrenar cabezas lineales sobre los embeddings de 3072 dimensiones para tareas de clasificación, con mejor generalización entre instituciones.
- Normalización pre-analítica de características: al usar el adaptador, los modelos aguas abajo no necesitan controlar manualmente el escáner o la tinción, lo que simplifica el entrenamiento en datasets heterogéneos.
- Registro de tiles entre condiciones: la capacidad de emparejar la misma localización física bajo distintos escáneres o tinciones facilita tareas de alineación y comparación de regiones de tejido en investigación.
- Predicción de biomarcadores genómicos: la correlación HEST mejora con el adaptador (Pearson r de 0.3952 a 0.4122), lo que permite utilizarlo en modelos que relacionan imagen con expresión génica.
- Clasificación de tejido en flujos de screening: el modelo puede integrarse en pipelines de detección automática donde la variabilidad de adquisición es una fuente habitual de falsos negativos.
- Integración en sistemas de ayuda al diagnóstico: el adaptador hace viable el despliegue del modelo base en hospitales con equipamiento heterogéneo, reduciendo la necesidad de ajustes por centro.

## Benchmarks y rendimiento

| Metrica | Modelo base | + SPECTRA LoRA (n=3 seeds, media +/- 2SD) |
|---|---|---|
| PathoROB indice de robustez medio (cross-centre) | 0.759 | 0.908 +/- 0.005 |
| PLISM top-1 retrieval entre escaneres | 0.752 | 0.991 +/- 0.005 |
| PLISM top-1 retrieval entre tinciones | 0.560 | 0.883 +/- 0.036 |
| HEST Pearson r medio | 0.3952 | 0.4122 +/- 0.0022 |
| CPTAC AUC | 0.6643 | 0.6898 +/- 0.0016 |

Los valores del adaptador provienen de la tabla del paper SPECTRA, con n=3 semillas. Los números del modelo base son evaluaciones deterministas individuales y no llevan dispersión.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.4 GB, pero para la inferencia es necesario cargar el modelo base `kaiko-ai/midnight`, cuyo tamaño no está especificado en la información disponible.
- El código de ejemplo usa `model.float().eval().cuda()`, por lo que se requiere una GPU compatible con CUDA.
- No se dispone de estimaciones de VRAM, latencia o throughput. No es posible afirmar si cabe en GPU de consumo sin conocer el tamaño del modelo base.
- El despliegue se realiza mediante Hugging Face Transformers con PEFT. No es compatible con vLLM ni llama.cpp, dado que se trata de un modelo de visión y no de un LLM.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos de la misma categoría con datos contrastables. La única comparación disponible es la del modelo base frente al adaptador, presentada en la sección de benchmarks.

## Limitaciones y advertencias

- El adaptador solo se ha probado contra la revisión exacta `adc6b15679c981cce6f9b018bbad09d16eeeda9f` del modelo base. Aplicarlo a otra revisión no está testeado.
- El preprocesamiento debe coincidir exactamente: normalización `(0.5, 0.5, 0.5)` y resize bilineal a 224x224. Usar estadísticas de ImageNet o interpolación bicúbica degrada silenciosamente los resultados.
- Los checkpoints liberados corresponden a pasos dentro del warmup de 200, por lo que están sin recocido. Esto puede afectar al rendimiento si se comparan con pesos totalmente anelados.
- Los tres seeds no forman un ensemble. Se debe elegir uno o reportar la dispersión entre los tres; no promediar como si fuera un único modelo.
- El archivo `training_config.json` contiene el token `-Infinity` en el campo `same_core_logit_bias_mean`, que no es JSON válido y puede rechazar parsers como `JSON.parse`.
- La licencia MIT se aplica únicamente al adaptador. La licencia del modelo base `kaiko-ai/midnight` no está especificada, por lo que deben revisarse sus condiciones de uso comercial.
- No se han documentado sesgos formales en tejidos o geografías. Al ser un modelo de visión, no aplica riesgo de alucinación textual, aunque sí puede producir falsos positivos en tareas de clasificación.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/medarc/spectra-midnight-12k-lora
- Modelo base en Hugging Face: https://huggingface.co/kaiko-ai/midnight
- Repositorio OpenMidnight en GitHub: https://github.com/MedARC-AI/OpenMidnight
- Organización MedARC en GitHub: https://github.com/MedARC-AI
