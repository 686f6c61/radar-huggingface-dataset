# annonymous4science/diffsign-public-decoder-256bit

## Resumen

DiffSign public decoder (256-bit) es un artefacto de verificación pública para el sistema de marcas de agua DiffSign, diseñado para atribuir la procedencia de imágenes generadas por modelos de difusión. El modelo, publicado por el autor anónimo `annonymous4science`, consiste únicamente en el decodificador `D_psi`, que extrae 256 bits de una imagen dada y produce logits por bit. El codificador secreto `E_phi` no se publica por diseño, ya que el modelo de amenaza asume que un adversario puede tener acceso a la interfaz de verificación pero no puede invocar el codificador.

El decodificador es una red neuronal de 5,4 millones de parámetros que opera sobre los latentes del VAE de Stable Diffusion v1.5. Su salida son logits de forma `[batch, 256, 2]` y LLRs (log-likelihood ratios) crudos de forma `[batch, 256]`. Está pensado para integrarse en un pipeline de verificación que incluye un código polar con lista de decodificación y un registro de transparencia auditado. Su relevancia radica en permitir la verificación pública de la autoría de imágenes sintéticas sin exponer el mecanismo de marcado, un requisito clave para la atribución forense en entornos de difusión generativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder neuronal (arquitectura exacta no especificada) |
| Parametros totales | 5.422.300 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 512x512) |
| Tipos de cuantizacion | no disponible (referencia en float32; half precision permitida pero no normativa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (safetensors no indicado) |

## Arquitectura y entrenamiento

La arquitectura interna del decodificador no se detalla en la documentación pública. Se sabe que recibe como entrada los latentes del VAE de Stable Diffusion v1.5 (posterior mode multiplicado por el factor de escala) y produce logits por cada uno de los 256 bits de la marca de agua. El modelo contiene 38 tensores y 5.422.300 parámetros, y su salida se interpreta como LLRs restando `logit(bit=1) - logit(bit=0)`.

No se proporciona información sobre el proceso de entrenamiento, el dataset utilizado, ni si se aplicaron técnicas como RLHF o DPO. El artefacto publicado es exclusivamente de inferencia: no incluye bucle de entrenamiento, cargador de datos, implementaciones de ataques ni scripts de generación masiva. La verificación normativa se define en `float32`; el uso de media precisión puede desplazar los LLRs hasta `2e-2` y alterar decisiones en bits con LLR cercano a cero.

## Capacidades

- Decodificación de marcas de agua de 256 bits en imágenes generadas por difusión.
- Salida de logits y LLRs crudos por bit, listos para un decodificador de canal (código polar con lista de tamaño 8).
- Integración con el VAE público de Stable Diffusion v1.5 para preprocesado.
- Soporte de verificación pública sin acceso al codificador secreto.
- Compatible con inferencia en `float32` (referencia) y `float16` (para throughput, con posibles discrepancias).
- Diseñado para un pipeline de atribución que resuelve un payload de 112 bits a través de un registro de transparencia auditado.

## Casos de uso

- Verificación de procedencia de imágenes sintéticas: un servicio puede comprobar si una imagen fue generada por un modelo de difusión concreto usando el decodificador público, sin revelar el mecanismo de marcado.
- Atribución de autoría en plataformas de contenido: los creadores pueden incrustar marcas de agua invisibles y los verificadores externos pueden confirmar la autoría mediante el decoder público.
- Auditoría forense de imágenes: organismos reguladores o periodistas pueden verificar si una imagen difundida proviene de un sistema de generación específico, usando solo el artefacto público.
- Control de calidad en pipelines de generación: integración en sistemas de producción para validar que las imágenes generadas llevan la marca de agua correcta antes de su distribución.
- Investigación en watermarking: el decodificador sirve como referencia para estudiar la robustez de las marcas de agua frente a ataques, aunque el propio artefacto no incluye implementaciones de ataques.
- Demostración de concepto para verificación descentralizada: el modelo puede desplegarse en entornos sin GPU (por su pequeño tamaño) para verificar imágenes en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, tasas de error de bit, ni comparaciones con otros sistemas de watermarking.

## Requisitos de hardware

- El modelo tiene solo 5,4 millones de parámetros, por lo que cabe en cualquier GPU moderna e incluso en CPU.
- VRAM estimada: menos de 100 MB en `float32` (el archivo pesa 21,7 MB). En `float16` aún menos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060 o superior es más que suficiente.
- Es viable en entornos sin GPU: inferencia en CPU con PyTorch es factible para verificación puntual.
- Opciones de despliegue: PyTorch nativo, posible integración con vLLM o TGI no es necesaria al ser un modelo de imagen; se puede usar con Hugging Face Transformers o directamente con el checkpoint.
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamaño del modelo se espera una inferencia en milisegundos en GPU.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada, ni se dispone de datos de rendimiento para establecer una comparación objetiva con otros sistemas de watermarking para difusión.

## Limitaciones y advertencias

- Solo se publica el decodificador; el codificador es privado, lo que limita la capacidad de probar el sistema completo de forma independiente.
- La verificación normativa es en `float32`; el uso de `float16` puede provocar discrepancias entre verificadores en hardware distinto.
- Requiere el VAE de Stable Diffusion v1.5 para el preprocesado; no es compatible directamente con otros modelos de difusión sin adaptación.
- No se especifica licencia, por lo que el uso comercial es incierto y requiere contacto con el autor.
- No hay información sobre sesgos o riesgos de alucinación, al ser un modelo discriminativo y no generativo.
- El artefacto no incluye herramientas de ataque ni benchmarks, por lo que su robustez frente a manipulaciones no está documentada.

## Enlaces

- [Hugging Face: annonymous4science/diffsign-public-decoder-256bit](https://huggingface.co/annonymous4science/diffsign-public-decoder-256bit)
