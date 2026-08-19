# joshycodes/op-meco-scratch-c0

## Resumen

El modelo `joshycodes/op-meco-scratch-c0` es un testbed de pretraining desde cero (from-scratch) desarrollado por el usuario joshycodes dentro del proyecto meco. Su objetivo es investigar el condicionamiento por metadatos (metadata-conditioning) aplicado desde el token cero, es decir, desde la primera posición de la secuencia, un punto de intervención que la literatura señala como crítico. El modelo forma parte de una familia de tres variantes (c0, -plain y -tagged) que comparten la misma configuración pero difieren en el formato de los documentos de entrenamiento; esta variante concreta usa documentos sin etiquetar (control).

Con 77 millones de parámetros y una arquitectura OLMo-2 de 8 capas y 8 cabezas, es un modelo pequeño pensado para experimentos controlados de investigación, no para uso productivo. Se entrenó sobre 90 478 documentos etiquetados del dataset Dolma (revisión `48f4f8aa`) durante aproximadamente 4 épocas, con una ventana de bloque de 1024 tokens. Su relevancia radica en servir como punto de comparación para estudiar cómo influye el condicionamiento de persona o metadatos en el aprendizaje desde el inicio del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo-2, decoder-only, d512, 8 capas, 8 cabezas, embeddings atadas |
| Parametros totales | 77 049 344 (~77M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (block size de entrenamiento: 1024) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible (tokenizer OLMo, presumiblemente ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo-2 en su variante pequeña: 512 dimensiones de embedding, 8 capas transformer decoder-only y 8 cabezas de atencion, con embeddings de entrada y salida atadas. Usa el tokenizer estandar de OLMo. El entrenamiento se realizo desde cero sobre 90 478 documentos etiquetados del dataset Dolma (revision `48f4f8aa`), con aproximadamente 4 epocas, learning rate 4e-4 con scheduler coseno, weight decay 0.1, block size 1024, batch size 64 y seed 17. La caracteristica distintiva es el condicionamiento por metadatos desde el token cero, aunque en esta variante concreta (c0) los documentos se presentan sin etiquetar, actuando como grupo de control frente a sus hermanos -plain y -tagged. El archivo `pretrain_stats.json` contiene el registro completo del entrenamiento.

## Capacidades

- Generacion de texto basica: al ser un modelo de lenguaje autoregresivo de 77M, puede producir texto coherente a corto plazo, aunque con limitaciones propias de su tamano.
- Condicionamiento por metadatos: esta disenado para experimentar con la insercion de metadatos (persona, contexto) en la secuencia de entrada, aunque esta variante no los usa.
- No se documentan capacidades especificas como tool calling, razonamiento avanzado, vision o audio. La informacion disponible no detalla benchmarks ni tareas concretas.

## Casos de uso

No se han documentado casos de uso especificos para este modelo. Dado su proposito de investigacion, los usos plausibles son:

- Estudios de metadata-conditioning: comparar el comportamiento de esta variante (control) con las variantes -plain y -tagged para aislar el efecto del etiquetado en el pretraining.
- Analisis de intervencion temprana: investigar como el condicionamiento desde el token cero afecta a la representacion interna y a la generacion posterior.
- Reproducibilidad cientifica: servir como punto de referencia para otros experimentos de pretraining desde cero con arquitecturas OLMo.
- Pruebas de scaling laws: al ser un modelo muy pequeno, permite ejecutar experimentos rapidos y baratos para validar hipotesis antes de escalar.
- Educacion e investigacion: util como ejemplo didactico de entrenamiento from-scratch con condicionamiento de metadatos.
- Desarrollo de tecnicas de control de persona: aunque esta variante no usa etiquetas, el conjunto completo del proyecto meco podria explorar como inyectar personalidad o rol en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 77M parametros, en fp32 ocupa unos 308 MB; en fp16 o bf16 unos 154 MB. Cabe en cualquier GPU consumer (incluso en una GTX 1650 de 4 GB) y tambien en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; para mayor comodidad, una RTX 3060 o superior.
- Opciones de despliegue: al ser un modelo safetensors, puede cargarse con transformers de HuggingFace, o convertirse a GGUF para llama.cpp u Ollama. Tambien es compatible con vLLM y TGI si se desea servir en produccion, aunque no es su fin.
- Latencia y throughput: no se dispone de mediciones oficiales, pero por su tamano la inferencia es casi instantanea en GPU y muy rapida en CPU.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa con otros modelos de la misma categoria (tamano y proposito). El propio proyecto meco incluye variantes hermanas (-plain y -tagged) que serian los comparadores naturales, pero no se han publicado metricas de rendimiento.

## Limitaciones y advertencias

- Modelo de investigacion: no esta pensado para produccion ni para tareas reales; su tamano y entrenamiento limitado producen texto de baja calidad y con frecuentes incoherencias.
- Sesgos y alucinaciones: al entrenarse sobre Dolma, puede reflejar sesgos presentes en esos datos y generar contenido factualmente incorrecto.
- Contexto limitado: la ventana de 1024 tokens es corta para dialogos extensos o documentos largos.
- Sin fine-tuning: no se ha ajustado para instrucciones ni para tareas especificas; no soporta tool calling ni razonamiento avanzado.
- Idiomas: no se especifican idiomas soportados; el tokenizer OLMo esta disenado principalmente para ingles.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el modelo no ofrece garantias de calidad ni soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/op-meco-scratch-c0
