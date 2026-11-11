# posterior-learning/pl-qwen3.8-27b

## Resumen

pl-qwen3.8-27b es un modelo multimodal de tipo image-text-to-text publicado por posterior-learning. No se trata de un entrenamiento desde cero, sino de una fusión (merge) del modelo base Qwen/Qwen3.8-27B con un adaptador LoRA de rango 16 entrenado por el propio autor dentro de su suite de experimentos "posterior-learning" (PL). El resultado es un checkpoint completo de 27.781.427.952 parámetros (unos 27,8 mil millones) en formato safetensors, con un repositorio de 55,6 GB, pensado para cargarse directamente con transformers sin necesidad de aplicar el adaptador por separado.

El modelo hereda la arquitectura, el tokenizador, la plantilla de chat, los procesadores y la configuración de generación del base Qwen/Qwen3.8-27B, de modo que su comportamiento estructural es idéntico al del modelo original; la única diferencia son los 400 módulos LoRA fusionados en bf16. Esto lo convierte en una variante de conveniencia para quien quiera reproducir exactamente el estado base + adaptador con una sola descarga, manteniendo compatibilidad con endpoints y con el pipeline image-text-to-text.

Su relevancia es acotada y experimental: el repositorio no declara licencia, idiomas soportados ni resultados de benchmarks, y el propio autor documenta que la fusión se hizo en bf16 (por lo que las salidas pueden diferir ligeramente de ejecutar base + adaptador en tiempo de ejecución). Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivada de Qwen/Qwen3.8-27B (tag de libreria qwen3_5); detalles internos no disponibles |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos: se parte del checkpoint Qwen/Qwen3.8-27B (aproximadamente 27,8 mil millones de parámetros, multimodal image-text-to-text) y se le aplica el adaptador LoRA `richmondsin/self-designed-thought-sync: pl-suite-live-27b/run-v43-27bt-suite8-s11-lenfix/adapter_50` (commit 6aff82af). El adaptador tiene rango 16 y `lora_alpha` 32, con una regla de fusión por módulo `W <- W + (lora_alpha / r) * B @ A`, es decir, escala 2.0, calculada en fp32 y almacenada en bf16. Se fusionaron 400 módulos; el resto de tensores son byte-idénticos al base.

El adaptador corresponde al estado tras la actualización 35 de 50 del run-v43: un criterio de parada por divergencia KL en la actualización 35 hizo que se omitieran las actualizaciones 36 a 50 (regla de entrenamiento PL). No se documentan en la información disponible el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Las verificaciones de subida (MERGE-REPORT.json) confirman que 3 módulos aleatorios quedan dentro del redondeo bf16 respecto a `W + s*B@A` y que otros 799 tensores son byte-idénticos al base, con un total de bytes de tensores igual al del modelo original (55.562.855.904).

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.8-27B.
- Procesamiento de imagen y texto conjuntamente (pipeline image-text-to-text): entrada de imágenes junto con instrucciones en lenguaje natural.
- Razonamiento y respuesta a instrucciones, en la medida en que lo soporte el base.
- Capacidades de código y matemáticas: no verificadas de forma independiente en la información disponible.
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- Evaluación de experimentos de ajuste fino: cargar el checkpoint directamente con transformers para comparar su comportamiento frente al base Qwen/Qwen3.8-27B y reproducir el estado base + adaptador sin gestionar el LoRA por separado.
- Investigación sobre fusión de LoRA: servir como referencia reproducible de una fusión con escala 2.0 en 400 módulos, útil para estudiar el impacto del redondeo bf16 frente a la aplicación del adaptador en tiempo de ejecución.
- Prototipado de asistentes multimodales: al aceptar pares imagen-texto, permite construir demos de descripción de imágenes, respuesta a preguntas visuales o extracción de información de capturas y documentos escaneados.
- Reproducibilidad de pipelines de entrenamiento: el repositorio documenta hashes, commits y reglas de parada, lo que facilita auditar el proceso de merge en entornos de investigación.
- Pruebas de regresión de infraestructura: con 27,8 mil millones de parámetros y 55,6 GB de pesos, es un candidato razonable para validar despliegues en transformers y endpoints compatibles antes de pasar a modelos mayores.
- Base para experimentos adicionales de ajuste: al ser un checkpoint completo en safetensors, puede recibir nuevos adaptadores LoRA o procesos de cuantización para probar variantes sobre el estado ya fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan unos 55,6 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) para cargar el modelo completo en bf16 sin cuantizar.
- Cuantización: no se publican versiones GGUF ni cuantizaciones oficiales; para caber en GPUs de 24 GB (RTX 4090) o 48 GB (A6000, L40S) habría que cuantizar el checkpoint por cuenta propia (por ejemplo, a 8 o 4 bits), con la pérdida de calidad correspondiente y sin garantías del autor.
- GPU recomendadas: A100 80 GB y H100 80 GB para bf16; configuraciones multi-GPU (2 x 48 GB o 4 x 24 GB) mediante tensor parallelism para servir el modelo sin cuantizar.
- Despliegue: compatible con transformers (librería declarada) y con endpoints compatibles según los tags; vLLM, llama.cpp, Ollama o TGI no están confirmados en la información disponible, y llama.cpp requeriría una conversión a GGUF que no se distribuye.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pl-qwen3.8-27b | 27,78 B | no disponible | no disponible | Hugging Face (0 descargas) | Merge de LoRA sobre Qwen3.8-27B, multimodal |
| Qwen/Qwen3.8-27B (base) | ~27,8 B | no disponible | no disponible | Hugging Face | Modelo original; misma arquitectura y tokenizador |
| Alternativas de ~27-30 B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados para comparar |

No se dispone de información suficiente para establecer una comparativa cuantitativa con modelos de la misma categoría; los datos del base coinciden en tamaño con este checkpoint, y el resto de alternativas no están documentadas en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no hay garantía de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Idiomas no declarados: se desconoce el soporte real multilingüe y el comportamiento en castellano.
- Sin benchmarks: no existen métricas publicadas que permitan estimar calidad, razonamiento o robustez frente al base.
- Diferencia numérica por la fusión: al mergear en bf16, las salidas pueden diferir ligeramente de ejecutar base + adaptador en tiempo de ejecución; no es un clon bit a bit del pipeline original.
- Entrenamiento truncado: el adaptador corresponde a la actualización 35 de 50, con parada por KL; el ajuste no completó el run previsto.
- Riesgo de alucinación y sesgos: inherentes al modelo base y no evaluados de forma específica para esta fusión.
- Contexto máximo desconocido: no se puede planificar el uso con documentos largos sin verificar la configuración del base.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria y el soporte disponible.
- Sin cuantizaciones oficiales: el despliegue en hardware de consumo requiere trabajo adicional de conversión y validación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/posterior-learning/pl-qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset y adaptador de origen: https://huggingface.co/datasets/richmondsin/self-designed-thought-sync/tree/6aff82af793d79de0da9a8f041e6caeefd1623de/pl-suite-live-27b/run-v43-27bt-suite8-s11-lenfix/adapter_50
