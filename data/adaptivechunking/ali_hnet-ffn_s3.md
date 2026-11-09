# AdaptiveChunking/ali_hnet-ffn_s3

## Resumen

`ali_hnet-ffn_s3` es un modelo de investigación byte-level basado en la arquitectura H-Net, publicado por el usuario AdaptiveChunking en Hugging Face. No es un modelo de lenguaje conversacional al uso: es un artefacto experimental de un pipeline de tokenización dinámica por chunks (dynamic chunking) sobre bytes, entrenado con el framework [beetle-hnet](https://github.com/suchirsalhan/beetle-hnet). El objetivo declarado es estudiar cómo una red puede aprender a segmentar y procesar secuencias de bytes sin un tokenizador fijo, con una política de dechunking basada en media móvil exponencial (EMA) y un objetivo de tipo ratio.

El modelo tiene 22.785.033 parámetros y se entrenó durante 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre tres idiomas: inglés, turco y finés. La model card no documenta capacidades de generación de texto, razonamiento, código ni diálogo; se trata de un checkpoint de investigación con pesos en safetensors y estado de entrenador reanudable.

Su relevancia es acotada y experimental: sirve como referencia para quienes investigan tokenización byte-level adaptativa, H-Net y segmentación dinámica, no como modelo listo para producción. La licencia Apache 2.0 facilita su reutilización, pero la ausencia de benchmarks, de idiomas declarados formalmente y de pipeline de inferencia limita su aplicabilidad práctica.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | H-Net con FFN (`architecture=hnet_ffn`), byte-level, chunking dinámico |
| Parámetros totales | 22.785.033 |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (entrenado con secuencias de 1024 bytes) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | entrenado con `en`, `tr`, `fi`; no se declara soporte formal |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `config.json`, `training_config.yaml` y `training_state/checkpoint.pt` |

## Arquitectura y entrenamiento

La arquitectura es una H-Net con FFN (`hnet_ffn`), orientada a operar directamente sobre bytes en lugar de tokens subword. El entrenamiento usa un objetivo de tipo ratio (`objective=ratio`), sin schedule (`schedule=None`), y una política de dechunking basada en EMA (`dechunk=ema`). La semilla del run es 3. El régimen de entrenamiento fue de 6000 pasos con batches de 32 secuencias de 1024 bytes, sobre los idiomas inglés, turco y finés.

El repositorio sigue el layout estilo Beetle: ramas `step-N` con checkpoints en un schedule logarítmico por fases (0, 1, 2, 4, 6, 8, 16, ..., 2^k desde el inicio de cada fase de objetivo, más el paso final), cada una con pesos, configuración y estado reanudable del entrenador. La rama `main` contiene los pesos y configuración del último paso, además de `log.jsonl`, `final.json` y las pruebas de frontera FLORES+ en `probe/` una vez finalizado el run. Los tensores atados se almacenan una sola vez y `config.json["tied_weights"]` mapea los nombres eliminados a los almacenados.

No se documentan detalles sobre composición exacta del dataset, número total de tokens procesados, ni uso de RLHF/DPO. Tampoco se describen innovaciones como decodificación especulativa o atención linear más allá del propio mecanismo de chunking dinámico.

## Capacidades

- Procesamiento byte-level de secuencias: el modelo opera sobre bytes crudos, sin tokenizador subword fijo.
- Chunking dinámico: aprende segmentación adaptativa de la secuencia mediante la política de dechunking EMA.
- Entrenamiento multilingüe limitado a inglés, turco y finés según la configuración del run.
- Checkpoints reanudables: cada rama `step-N` incluye estado completo del entrenador para continuar el entrenamiento.
- Pruebas de frontera FLORES+: la rama `main` incluye sondas `probe/` para evaluar límites de segmentación.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se declara capacidad de generación de texto conversacional ni de código.

## Casos de uso

- Investigación en tokenización byte-level: usar el checkpoint para reproducir experimentos de segmentación dinámica y comparar políticas de dechunking (EMA frente a alternativas) sobre los mismos datos.
- Estudio de arquitecturas H-Net: servir de referencia para analizar cómo una H-Net con FFN aprende representaciones a partir de bytes en lugar de tokens subword.
- Evaluación de fronteras de chunking: emplear las sondas FLORES+ incluidas en `probe/` para medir la calidad de la segmentación en los tres idiomas de entrenamiento.
- Reproducibilidad de entrenamiento: reanudar desde cualquier rama `step-N` usando `training_state/checkpoint.pt` para extender el entrenamiento o cambiar hiperparámetros.
- Baseline para experimentos multilingües de bajo recursos: comparar el comportamiento en turco y finés (idiomas aglutinantes) frente a inglés con tokenizadores subword convencionales.
- Docencia y divulgación: ilustrar en un curso o artículo cómo se estructura un pipeline de chunking dinámico con checkpoints por fases y estado reanudable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 22,8 M de parámetros, los pesos en fp32 ocupan aproximadamente 91 MB; en fp16 unos 46 MB. La VRAM real depende del estado del chunking dinámico y del tamaño de secuencia, no documentados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para cargar los pesos; para entrenamiento o runs largos se recomienda RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño reducido del modelo.
- Opciones de despliegue: la librería declarada es PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI. La carga se realiza vía `huggingface_hub` y `torch.load` del checkpoint o de `model.safetensors`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ali_hnet-ffn_s3 | 22,8 M | no disponible (entrenado a 1024 bytes) | H-Net byte-level con chunking dinámico | Apache 2.0 | Hugging Face |
| Byte-level BPE estándar (referencia conceptual) | no aplica | no aplica | Tokenizador subword, no modelo | variable | amplia |
| Modelos H-Net de investigación comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (H-Net byte-level con chunking dinámico) en la documentación proporcionada.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni documentado para uso en producción, diálogo ni generación de texto controlada.
- Idiomas limitados: el entrenamiento cubre solo inglés, turco y finés; no hay declaración formal de idiomas soportados ni evaluación en otros.
- Sin benchmarks: no hay métricas publicadas de calidad, lo que impide evaluar su rendimiento frente a alternativas.
- Contexto corto en entrenamiento: las secuencias usadas son de 1024 bytes, lo que limita la extrapolación a contextos mayores.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo byte-level experimental, su comportamiento fuera de distribución es incierto.
- Licencia Apache 2.0: permite uso comercial, pero la falta de documentación sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles restricciones asociadas.
- Estado del repo: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por la comunidad.
- Dependencia del código de beetle-hnet: la inferencia y el entrenamiento requieren el repositorio externo, no incluido en el paquete de Hugging Face.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AdaptiveChunking/ali_hnet-ffn_s3
- Repositorio beetle-hnet: https://github.com/suchirsalhan/beetle-hnet
