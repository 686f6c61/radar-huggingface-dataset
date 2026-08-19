# drlee1/constraint-carrier-directions

## Resumen

Este repositorio, publicado por el usuario drlee1, no contiene un modelo de lenguaje completo, sino un conjunto de artefactos de interpretabilidad: vectores de dirección de activación (constraint direction vectors) extraídos de modelos de la familia Qwen3 mediante la técnica de difference-in-means. El objetivo es permitir la investigación sobre activation steering para controlar el seguimiento de restricciones (constraint-following) en modelos generativos. Los vectores se proporcionan por modelo, por capa y por protocolo de extracción, en formato safetensors, junto con manifiestos que documentan su procedencia.

La relevancia de este trabajo radica en que ofrece herramientas para estudiar cómo las representaciones internas de un modelo codifican instrucciones condicionales, un área activa en interpretabilidad mecanicista. Sin embargo, es importante subrayar que se trata de artefactos de investigación, no de un modelo desplegable, y que los propios autores advierten de que las direcciones no son transferibles entre modelos ni entre protocolos de extracción. La licencia es Apache-2.0, heredada de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de direccion de activacion (difference-in-means) extraidos de Qwen3-0.6B, Qwen3-1.7B y Qwen3-4B |
| Parametros totales | No aplica (no es un modelo; son artefactos de interpretabilidad) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo base Qwen3 del que se extrajeron) |
| Tipos de cuantizacion | No disponible (los vectores se almacenan en safetensors, sin cuantizacion) |
| Idiomas soportados | No disponible (heredados del modelo base, no declarados en el repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (vectores unitarios y normas por capa) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado, sino artefactos derivados de modelos Qwen3 ya existentes. La metodologia de extraccion sigue el enfoque de difference-in-means: para cada capa `ℓ` y para un conjunto de pares de prompts que incluyen u omiten una restriccion concreta, se calcula la diferencia entre las activaciones medias en la posicion del ultimo token (`h^ℓ_{t*}`) con y sin la restriccion. El vector resultante se normaliza para obtener la direccion unitaria `v̂_c^ℓ`. Los ficheros incluyen tambien las normas de dichos vectores.

El proceso se implementa mediante el harness constraint-carrier (repositorio GitHub del mismo autor). Los protocolos de extraccion incluyen last-token y max-pool, y los autores advierten de que ambos producen direcciones casi ortogonales (angulo mediano de aproximadamente 88 grados), lo que indica que la eleccion del protocolo es critica. No se documenta el numero de prompts utilizados ni el desglose del dataset de extraccion.

## Capacidades

- Proporciona direcciones de activacion por capa para tres tamanos de Qwen3 (0.6B, 1.7B y 4B).
- Permite experimentos de activation steering: inyectar o restar el vector en las activaciones de una capa concreta para modificar el comportamiento del modelo respecto al seguimiento de restricciones.
- Incluye manifiestos JSON con la configuracion de extraccion y la procedencia de cada artefacto.
- No incluye capacidades de generacion, razonamiento, codigo, vision ni tool calling, ya que no es un modelo de lenguaje.
- No es un mecanismo de seguridad ni un guardrail; los autores lo declaran explicitamente como herramienta de investigacion.

## Casos de uso

- Investigacion en interpretabilidad mecanicista: estudiar como las representaciones internas de Qwen3 codifican restricciones condicionales (por ejemplo, "responde solo en espanol" o "no menciones la palabra X").
- Analisis comparativo de capas: identificar en que capas y con que protocolo (last-token vs max-pool) las direcciones de restriccion son mas efectivas o mas ortogonales.
- Desarrollo de tecnicas de steering: probar la inyeccion de direcciones en modelos Qwen3 para modificar su comportamiento sin fine-tuning, como base para investigacion futura.
- Reproducibilidad: el harness permite reproducir la extraccion en otros modelos o con otras restricciones, ampliando el conjunto de artefactos.
- Educacion: servir como ejemplo practico de difference-in-means aplicado a modelos modernos, con codigo y artefactos publicos.
- Auditoria de modelos: explorar si las direcciones de restriccion revelan sesgos o comportamientos no deseados en el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no reporta metricas de calidad de generacion, ni comparaciones con otros metodos de interpretabilidad. La unica metrica mencionada es la ortogonalidad entre protocolos (angulo mediano de aproximadamente 88 grados), que no constituye un benchmark de rendimiento.

## Requisitos de hardware

- Los artefactos son ficheros safetensors de tamano reducido (el repositorio ocupa 0.0 GB, es decir, menos de 1 GB en total). Su carga no requiere GPU.
- Para reproducir la extraccion con el harness, el autor indica que Qwen3-0.6B puede ejecutarse en Apple MPS (portatil con chip Apple Silicon) y Qwen3-4B requiere CUDA con dtype bfloat16 (por ejemplo, una GPU con al menos 8 GB de VRAM, como una RTX 3070 o superior).
- Para experimentos de steering sobre el modelo base, se necesitan los requisitos del propio Qwen3 (por ejemplo, Qwen3-4B en bfloat16 ocupa aproximadamente 8 GB de VRAM; una RTX 4090 o A100 son adecuadas).
- Opciones de despliegue: no aplica para los artefactos en si; para el modelo base se pueden usar vLLM, llama.cpp, Ollama o TGI, pero el steering requiere acceso a las activaciones internas, lo que se hace tipicamente con bibliotecas como HuggingFace Transformers o el propio harness.

## Comparativa con modelos similares

No disponible. No se han encontrado repositorios comparables que publiquen direcciones de activacion para la misma tarea (constraint-following) sobre modelos Qwen3. La literatura de interpretabilidad incluye trabajos como los de representation engineering (RE) o activation addition, pero no hay una comparativa directa publicada en este repositorio.

## Limitaciones y advertencias

- Las direcciones son especificas de un modelo, una capa y un protocolo de extraccion; no son transferibles entre modelos ni entre protocolos. El autor advierte de que last-token y max-pool producen direcciones casi ortogonales.
- La reinyeccion de activaciones con estos vectores es una herramienta de investigacion, no un mecanismo de seguridad. No debe desplegarse como guardrail en produccion.
- No se documenta el numero de prompts utilizados para la extraccion, lo que limita la evaluacion de la robustez de las direcciones.
- No se proporcionan metricas de calidad del steering (por ejemplo, tasa de exito al inyectar la direccion).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere que es un trabajo reciente y sin validacion externa.
- La licencia Apache-2.0 se hereda de Qwen3, pero el autor no reclama ninguna transferencia automatica de licencia mas alla de lo que permita la licencia original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/drlee1/constraint-carrier-directions
- Harness constraint-carrier (GitHub): https://github.com/DONGRYEOLLEE1/constraint-carrier
- Modelos base Qwen3 (referencia): https://huggingface.co/Qwen/Qwen3-0.6B (y variantes 1.7B y 4B)
