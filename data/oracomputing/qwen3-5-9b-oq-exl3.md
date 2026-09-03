# oracomputing/Qwen3.5-9B-OQ-EXL3

## Resumen

Qwen3.5-9B-OQ-EXL3 es una cuantización EXL3 del modelo Qwen3.5-9B de Alibaba Cloud, producida por Ora Computing mediante su técnica propietaria de calibración cuantitativa denominada OraQuant (OQ). Este checkpoint está pensado exclusivamente para evaluación y pruebas internas, no para uso en producción. El modelo conserva la arquitectura y el número de parámetros del modelo base (~9 mil millones), pero reduce la precisión de los pesos a tasas de bits no uniformes de 2 a 4 bits por tensor, con la cabeza de salida a 5 bits y las embeddings en BF16.

La relevancia de esta versión radica en su huella reducida: unos 4,7 GB en disco y aproximadamente 2,7 GB de pesos residentes en GPU, lo que permite ejecutar un modelo de razonamiento de 9B en hardware de consumo. Al ser una cuantización sin ajuste fino adicional, el comportamiento esperado es similar al del modelo original, aunque con posibles degradaciones en entradas específicas. El acceso está restringido mediante una licencia personalizada que limita su uso a evaluación y prohíbe su comercialización, redistribución o ingeniería inversa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura del modelo base Qwen3.5-9B, no se especifican detalles adicionales) |
| Parametros totales | ~9 mil millones (archivo safetensors: 2.347.781.120) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | EXL3 trellis, 2-4 bits por tensor, output head 5 bits, embeddings BF16 |
| Idiomas soportados | Ingles |
| Licencia | Otra (licencia personalizada, solo evaluacion, no comercial) |
| Formato de pesos | safetensors (formato EXL3) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original Qwen3.5-9B de Alibaba Cloud, distribuido bajo Apache-2.0. No se ha realizado ningún entrenamiento adicional: los pesos son idénticos a los del modelo base, únicamente se ha reducido su precisión mediante OraQuant, un método de cuantización calibrada que codifica el cuerpo del transformer en formato EXL3 con tasas de bits no uniformes por tensor (2-4 bits). La cabeza de salida se mantiene a 5 bits y las embeddings en BF16, lo que reduce el tamaño del archivo a 4,7 GB y la memoria GPU necesaria a unos 2,7 GB.

El checkpoint solo incluye el modelo de lenguaje (entrada y salida de texto). Los encoders de vision/video y el cabezal de decodificacion especulativa (MTP) del modelo base no estan incluidos, por lo que esta version es exclusivamente textual. El comportamiento de razonamiento del modelo base se conserva a traves de la plantilla de chat incluida en `chat_template.jinja`.

## Capacidades

- Generacion de texto y chat conversacional en ingles.
- Razonamiento multi-paso (modelo de razonamiento, segun la documentacion).
- Soporte de plantilla de chat con tokens `<|im_start|>` y `<|im_end|>`.
- No incluye capacidades multimodales (vision, video) ni decodificacion especulativa.
- No se menciona soporte explicito de tool calling o function calling en la documentacion disponible.

## Casos de uso

- Evaluacion interna de modelos cuantizados: permite comparar el comportamiento del modelo cuantizado frente al modelo base en tareas de generacion de texto y razonamiento, ideal para medir el impacto de la cuantizacion.
- Benchmarking de rendimiento en hardware local: gracias a su reducida huella de memoria, se puede ejecutar en GPUs de consumo para medir latencia y throughput en configuraciones offline.
- Pruebas de prompt engineering y exploracion de comportamientos: la plantilla de chat y el modo de razonamiento permiten experimentar con distintos estilos de instruccion sin necesidad de infraestructura en la nube.
- Prototipos no productivos: desarrollo de prototipos de aplicaciones de chat o generacion de texto que no vayan a desplegarse en produccion ni a ofrecerse comercialmente.
- Investigacion academica sobre cuantizacion: util como ejemplo de aplicacion de cuantizacion trellis EXL3 con calibracion propietaria, aunque la licencia restringe su redistribucion.
- Pruebas de compatibilidad con exllamav3 y frontends basados en el (por ejemplo, TabbyAPI) para validar la integracion de modelos cuantizados en entornos de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,7 GB para los pesos residentes en GPU, mas memoria adicional para el cache y las activaciones (depende de la longitud de contexto).
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4070) es suficiente para ejecutar el modelo con un contexto moderado. Para contextos largos se recomienda mayor VRAM.
- Las embeddings se mantienen en BF16 y se almacenan en RAM del sistema, por lo que se requiere una cantidad razonable de RAM (al menos 8-16 GB).
- Opciones de despliegue: exllamav3 (v1.2.0 probado), servidores compatibles con exllamav3 como TabbyAPI.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-OQ-EXL3 (este) | ~9B | No disponible | EXL3 2-4 bits | Otro (evaluacion) | Acceso restringido |
| Qwen3.5-9B (base) | ~9B | No disponible (probablemente 128K) | BF16/FP16 | Apache-2.0 | Publico en HuggingFace |
| Otras cuantizaciones de Qwen3.5-9B (GGUF, GPTQ) | ~9B | Depende de la variante | GGUF, GPTQ | Apache-2.0 (si derivan del base) | Publico o restringido segun el autor |

No se dispone de datos de rendimiento comparativo entre estas opciones. La diferencia principal radica en el formato de cuantizacion (EXL3 frente a GGUF/GPTQ) y en la licencia, que en este caso limita el uso a evaluacion.

## Limitaciones y advertencias

- Licencia restrictiva: solo permite uso interno de evaluacion, prohibe uso comercial, redistribucion, ingenieria inversa y compartir los pesos con terceros.
- Sin garantias de produccion: el modelo se proporciona "tal cual" para pruebas y no esta certificado para entornos de produccion.
- Degradacion por cuantizacion: los modelos cuantizados pueden no replicar completamente el comportamiento del modelo base, especialmente en entradas dominios especificos o poco frecuentes.
- Solo texto: no incluye las capacidades multimodales del modelo base (vision, video).
- Idioma unico: soporta unicamente ingles, no hay soporte multilingue declarado.
- Riesgo de alucinacion y sesgos: como cualquier modelo de lenguaje, puede generar contenido incorrecto o sesgado; se recomienda validar las salidas cuidadosamente.
- Acceso gated: requiere aprobacion manual del autor para descargar los archivos, lo que limita su uso inmediato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/oracomputing/Qwen3.5-9B-OQ-EXL3
- Sitio web de Ora Computing: https://www.oracomputing.com/en
- Blog de Ora Computing: https://www.oracomputing.com/en/blog
- Contacto: https://www.oracomputing.com/en/contact
