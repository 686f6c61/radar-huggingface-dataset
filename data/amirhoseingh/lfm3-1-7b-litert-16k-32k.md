# AmirhoseinGH/LFM3-1.7B-LiteRT-16K-32K

## Resumen

LFM3-1.7B-LiteRT-16K-32K es una conversión comunitaria del modelo LiquidAI/LFM3-1.7B al formato LiteRT-LM, orientada a inferencia en dispositivo (on-device) y entornos edge. El autor, AmirhoseinGH, publica dos artefactos con capacidades de caché KV exportadas de 16.384 y 32.768 tokens respectivamente, ambos de tipo text-only (sin codificador de imagen ni audio) y cuantizados en precisión mixta INT4/INT8. La conversión se realizó con LiteRT-LM 0.19.0 sobre CPU Linux y no está compilada para NPU.

El interés de esta ficha no reside en el modelo base, sino en el proceso de empaquetado: demuestra cómo llevar un transformer de 1.700 millones de parámetros a un formato ejecutable en dispositivos móviles con un presupuesto de contexto configurable. El repositorio ocupa 2,9 GB y cada artefacto pesa aproximadamente 1,44 GB, lo que refleja el ahorro de la cuantización mixta frente a los pesos originales en FP16/FP32.

Se trata de un artefacto de nicho, sin descargas ni validación extensa más allá de comprobaciones de sanidad (16/16 metadatos, 6/6 plantillas, 7/8 preguntas cortas en CPU). El autor advierte explícitamente que no ha medido precisión en contexto largo, consumo de RAM en móvil ni velocidad de inferencia en teléfono, por lo que debe evaluarse en el dispositivo objetivo antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM3-1.7B; incluye 24 capas, 11 de atención y capas de atención deslizante) |
| Parametros totales | 1.700 millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 o 32.768 tokens según artefacto (capacidad de caché KV exportada) |
| Tipos de cuantizacion | Mixta post-entrenamiento: INT4 simétrico blockwise-32 en proyecciones MLP gate/up (w1, w3); INT8 per-channel en el resto de pesos; tensores de grafo en FP32 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | .litertlm (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B es un transformer de 1.700 millones de parámetros con 24 capas, de las cuales 11 son de atención completa y el resto emplean atención deslizante. Esta conversión no reentrena ni ajusta el modelo: aplica cuantización post-entrenamiento de precisión mixta sin dataset de calibración. Concretamente, las proyecciones MLP gate y up (w1 y w3, 48 tensores en total) se cuantizan a INT4 simétrico con bloques de 32; el resto de pesos (atención, convoluciones cortas, proyecciones down del MLP y la tabla de embedding/salida) se cuantizan a INT8 per-channel; y los tensores de grafo (activaciones del decoder, caché KV y estado de convolución) se mantienen en FP32.

La conversión reutiliza el exportador LiteRT Torch y una extensión `lfm3_extension.py` procedente de una receta comunitaria propuesta para los samples de Google AI Edge. Dicha extensión preserva el estado de convolución a través del prefill con padding y adapta la plantilla de chat a LiteRT-LM. Las firmas de prefill son 256, 64, 16, 4 y 1, más la firma de decode; el chunk máximo de prefill de 256 tokens reduce la memoria temporal frente al chunk de 1.024 de la receta original. Las 11 capas de atención usan cachés K/V completas de longitud exportada, sin buffers circulares en las capas de atención deslizante. La revisión del checkpoint fuente es `40ebe0aa6662c9d40389c2f5d565b6a2c6aebacd`.

## Capacidades

- Generación de texto en modo chat con plantilla adaptada a LiteRT-LM.
- Razonamiento y respuesta a preguntas cortas: en la validación del autor respondió correctamente 7 de 8 preguntas de sanidad.
- Modo "thinking" configurable mediante el flag `--thinking`, aunque el autor advierte que desactivarlo no garantiza ausencia de contenido de razonamiento ni de etiquetas `</think>` en la salida.
- Procesamiento de contexto configurable hasta 16.384 o 32.768 tokens, compartido entre prompt, historial, razonamiento y respuesta generada.
- Inferencia en CPU mediante el backend `cpu` de LiteRT-LM; no hay soporte NPU compilado en estos artefactos.
- Capacidades multimodales: no disponibles (los artefactos son text-only, sin codificador de imagen ni audio).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivo: el artefacto de 16K permite mantener conversaciones multi-turno con historial en teléfonos o equipos de gama baja, ejecutando todo el cómputo en CPU local sin enviar datos a la nube.
- Procesamiento de documentos largos en edge: con la variante de 32K se pueden resumir o extraer información de contratos, informes o correos extensos en un portátil sin GPU, siempre que se valide la precisión real en esa longitud (no medida por el autor).
- Aplicaciones de privacidad estricta: al no requerir conectividad, encaja en escenarios sanitarios, legales o industriales donde el texto no puede salir del dispositivo.
- Prototipado rápido de funcionalidades LLM en móvil: el formato `.litertlm` y el CLI `litert-lm run` permiten probar prompts y plantillas de chat con un solo comando antes de integrar en una app nativa.
- Filtrado y clasificación de texto local: respuestas cortas y deterministas (preguntas de sanidad, etiquetado simple) son viables con el backend CPU y el chunk de prefill reducido de 256 tokens.
- Evaluación comparativa de recetas de cuantización: el repositorio incluye scripts de reproducción, verificadores y registros de validación, útil para equipos que quieran replicar el pipeline con otros modelos o capacidades de caché.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única validación reportada por el autor es una comprobación de sanidad: 16/16 verificaciones de metadatos, 6/6 escenarios de renderizado de plantilla y 7/8 preguntas cortas en CPU (el fallo fue una pregunta de rima, respondiendo "violet" en lugar de "blue"). El autor indica explícitamente que la precisión en contexto completo de 16K/32K, el uso de RAM en móvil y la velocidad de inferencia en teléfono no han sido medidas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica directamente, ya que el backend validado es CPU; cada artefacto pesa aproximadamente 1,44 GB en disco (1.438.737.328 bytes para 16K y 1.438.802.864 bytes para 32K).
- GPU recomendadas: no disponible; no se ha validado aceleración por GPU en esta conversión.
- Cabe en GPU consumer: no disponible; el autor solo valida el backend `cpu` de LiteRT-LM.
- Opciones de despliegue: LiteRT-LM 0.19.0 con el CLI `litert-lm run` y backend `cpu`; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no soportan el formato `.litertlm`.
- Latencia y throughput: no disponibles; el autor no reporta mediciones de velocidad en móvil ni en escritorio.
- Memoria en dispositivo: no medida; el uso de RAM en móvil queda pendiente de validación por parte del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Validacion |
|---|---|---|---|---|---|
| LFM3-1.7B-LiteRT-16K-32K (esta ficha) | 1,7 B | 16K / 32K | .litertlm | LFM Open License v1.0 | Sanidad 7/8 en CPU; sin benchmarks |
| LiquidAI/LFM3-1.7B (modelo base) | 1,7 B | no disponible en la información | safetensors (formato habitual del modelo base) | LFM Open License v1.0 | No disponible en la información |
| Otras conversiones LiteRT-LM comunitarias | Variable | Variable | .litertlm | Según modelo base | No disponible en la información |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas comparables en la información proporcionada, por lo que la comparación se limita a parámetros, contexto exportado, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al heredar el modelo base, arrastra los sesgos de sus datos de entrenamiento, no auditados aquí.
- Riesgo de alucinación: no cuantificado; la validación se limita a 8 preguntas cortas, insuficiente para caracterizar la fiabilidad.
- El modo `--thinking false` no garantiza salida limpia: el autor observó etiquetas `</think>` y contenido de razonamiento en algunas respuestas.
- Precisión en contexto largo no validada: la capacidad de caché KV exportada (16K/32K) no equivale a precisión medida a esa longitud; el autor lo advierte explícitamente.
- Sin mediciones de RAM ni velocidad en móvil: el rendimiento en el dispositivo objetivo debe probarse antes de confiar en la caché completa.
- No es un modelo compilado para NPU; solo se ha validado el backend CPU de LiteRT-LM 0.19.0.
- Las capas de atención deslizante no usan buffers circulares en esta build, lo que puede afectar al uso de memoria en secuencias largas.
- Restricciones de licencia: aplica la LFM Open License v1.0 del modelo base; deben revisarse sus términos para uso comercial antes de desplegar.
- Artefacto comunitario sin descargas ni likes: no hay evidencia de uso en producción ni de mantenimiento continuado.
- Idiomas soportados no documentados: no se puede asumir cobertura multilingüe sin evaluarla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmirhoseinGH/LFM3-1.7B-LiteRT-16K-32K
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Pull request de la receta comunitaria en Google AI Edge: https://github.com/google-ai-edge/litert-samples/pull/505
- Receta de conversión (revisión fijada): https://github.com/john-rocky/litert-samples/tree/f20106802e8dbbe244fb6b510fe5db4633fa0da1/models/lfm/lfm3_1_7b/converted
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B (archivo LICENSE en el repositorio)
