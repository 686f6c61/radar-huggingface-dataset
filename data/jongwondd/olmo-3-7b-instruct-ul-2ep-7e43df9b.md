# Jongwondd/OLMo-3-7B-Instruct-UL-2ep-7e43df9b

## Resumen

OLMo-3-7B-Instruct-UL-2ep es un adaptador LoRA (PEFT) entrenado sobre el modelo base allenai/Olmo-3-7B-Instruct. Lo publica el usuario Jongwondd como artefacto de investigación y no constituye un modelo autónomo: requiere descargar los pesos del modelo base y cargar el adaptador encima. El entrenamiento se ha realizado con una metodología denominada UL sobre el conjunto PopQA train (14.951 pares, 4.534 casos), durante dos épocas completas, con rango LoRA 16 y alpha 32. La temática declarada es "negation", es decir, se orienta a modificar el comportamiento del modelo en contextos de negación.

El interés práctico es limitado para producción: el repositorio ocupa 0,2 GB, no incluye tokenizador ni pesos base y la propia model card advierte de que no se han añadido resultados de evaluación ni se reclama paridad de inferencia con el Hub público. Es relevante como pieza reproducible para investigadores que estudien el efecto de la negación en modelos de lenguaje de 7B y como ejemplo de publicación de adaptadores con procedencia de entrenamiento documentada.

La arquitectura subyacente es la del OLMo 3 de 7B parámetros de AI2 (transformer decoder-only), con contexto y tokenizador definidos por el modelo base; el adaptador no altera esa arquitectura, solo añade matrices de bajo rango en las capas seleccionadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de allenai/Olmo-3-7B-Instruct) con adaptador LoRA |
| Parametros totales | 7B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (definida por el modelo base) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; la cuantizacion depende del base) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere pesos base aparte |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de 7B parámetros. El método de ajuste es LoRA con rango 16, alpha 32 y dropout 0, inicializado desde el modelo base "fresh" (sin continuación de un adaptador previo). El entrenamiento se ejecutó durante 2 épocas sobre PopQA train, con 14.951 pares y 4.534 casos, lo que supone 29.902 ejemplos vistos y 1.872 pasos de optimizador. La metodología declarada es "UL" y se distingue explícitamente de las líneas base SFT, UL y DPO, que según el autor son ejecuciones distintas y no checkpoints ALiT.

La publicación incluye un fichero `training_provenance.json` con el objetivo específico del método, los hiperparámetros retenidos, el hash del resumen de la fuente y el hash de los datos de entrenamiento. Los bytes de los pesos no se han modificado: solo se ha hecho portable el localizador del modelo base y su revisión en la configuración PEFT, y se registran los hashes de configuración original y publicada. No se documentan innovaciones arquitectónicas adicionales (atención lineal, decodificación especulativa, etc.) más allá del propio ajuste LoRA.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Olmo-3-7B-Instruct.
- Comportamiento ajustado específicamente para contextos de negación (tag "negation"), aunque no se cuantifica la mejora.
- Conversación multi-turno mediante la plantilla de chat del modelo base.
- Uso del tokenizador y procesador del modelo base, incluidos inputs de imagen "when applicable" según la model card.
- No se declaran capacidades de tool calling, function calling ni razonamiento multi-paso propias del adaptador; dependen del base.
- Capacidades multilingües: solo inglés declarado.

## Casos de uso

- Investigación sobre negación en LLM: permite comparar el comportamiento del base frente al adaptador en prompts con negaciones, usando el mismo tokenizador y plantilla de chat.
- Reproducción de experimentos: el `training_provenance.json` y los hashes permiten reconstruir la configuración exacta del ajuste LoRA para verificar resultados.
- Estudio de metodologías de ajuste ligero: sirve como referencia de una ejecución LoRA r=16/alpha=32 sobre PopQA con dos épocas y 1.872 pasos.
- Evaluación de robustez ante negación en pipelines de QA: se puede integrar en un banco de pruebas que mida si el modelo responde correctamente a preguntas formuladas en negativo.
- Docencia y formación: ejemplo práctico de publicación de adaptadores PEFT con procedencia documentada y carga mediante `PeftModel.from_pretrained`.
- Análisis de degradación por fine-tuning: útil para medir pérdida de capacidades generales tras un ajuste tan específico y de pocas épocas.
- Base para experimentos de merging: al ser un adaptador LoRA sin fusionar, permite probar técnicas de merge con los pesos base y comparar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que esta subida no añade resultados de evaluación y que las splits de evaluación observadas previamente son datos de desarrollo, no test independiente. Las pérdidas de entrenamiento no son puntuaciones de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador aislado; depende del modelo base de 7B. En bfloat16, el base completo requiere aproximadamente 14-16 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño del base, GPUs de 24 GB o más (RTX 4090, A100, H100) son las habituales para 7B en precisión completa.
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en bfloat16; en GPUs de 16 GB requeriría cuantización del base, no documentada aquí.
- Opciones de despliegue: carga mediante Transformers + PEFT (`PeftModel.from_pretrained`) con `device_map="auto"`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jongwondd/OLMo-3-7B-Instruct-UL-2ep | 7B (base) + LoRA | no disponible | Adaptador LoRA de investigación | apache-2.0 | Hugging Face, 0 descargas |
| allenai/Olmo-3-7B-Instruct | 7B | no disponible en esta ficha | Modelo base completo | no disponible en esta ficha | Hugging Face (modelo base referenciado) |
| Alternativas de 7B ajustadas con LoRA para investigación | 7B | variable | Adaptadores PEFT | variable | variable |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere el modelo base allenai/Olmo-3-7B-Instruct (revisión `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`) y un entorno con Transformers y PEFT compatibles.
- La model card advierte de que no se reclama paridad de descarga/inferencia en el Hub público; solo se comprobó localmente el parseo de la configuración del adaptador.
- Checkpoint de investigación, no validado para seguridad en producción; las salidas pueden ser incorrectas, sesgadas, malformadas o repetitivas.
- Sin resultados de evaluación publicados; no se puede afirmar mejora en negación ni conservación de capacidades generales.
- Solo idioma inglés declarado.
- Riesgo de alucinación y sesgos heredados del modelo base, no cuantificado.
- Licencia apache-2.0 en el adaptador, pero se aplican la licencia y restricciones del modelo base (ver `LICENSE`, `NOTICE` y `USE_POLICY.md` del upstream).
- No implica afiliación ni respaldo del proveedor del modelo base.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Jongwondd/OLMo-3-7B-Instruct-UL-2ep-7e43df9b
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Revisión del base usada: `6e5971d9eba42665f5bd5a0fcf047f299ce1dccc`
- Fichero de procedencia: `training_provenance.json` (incluido en el repositorio del adaptador)
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
