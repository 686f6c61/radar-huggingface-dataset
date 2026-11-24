# danyloooah/reax-g2-soup3

## Resumen

reax-g2-soup3 es un modelo de lenguaje publicado en Hugging Face por el usuario danyloooah bajo licencia Apache 2.0. Se distribuye en formato safetensors con un total de 31.273.088.876 parámetros (aproximadamente 31,3 mil millones), lo que lo sitúa en la categoría de modelos de gran tamaño aptos para despliegues en hardware de gama alta. El repositorio ocupa 62,6 GB y está marcado como de acceso restringido (gated), por lo que es necesario aceptar las condiciones en la plataforma antes de descargarlo.

La información pública disponible es muy limitada: no se especifican la longitud de contexto, los idiomas soportados, la composición del dataset de entrenamiento ni los resultados de benchmarks. El tag "gemma4" sugiere una posible relación con la familia Gemma de Google, y el tag "reax" apunta a un proyecto o técnica de ajuste propia del autor, pero ninguno de estos extremos está confirmado en la documentación del repositorio. El sufijo "soup3" es habitual en la nomenclatura de modelos fusionados mediante técnicas de model soup (promediado de pesos), aunque no se detalla el proceso.

Por tanto, esta ficha se limita a los datos verificables del repositorio y marca explícitamente como "no disponible" todo aquello que no figura en la información proporcionada. Es relevante ahora porque aparece como un modelo de 31B con licencia permisiva, pero su adopción en producción exige una evaluación directa por parte del usuario dada la ausencia de documentación técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (tag "gemma4" sugiere familia Gemma, sin confirmar) |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El tag "gemma4" en el repositorio podría indicar que deriva de la familia Gemma de Google, y el tag "reax" sugiere algún tipo de ajuste o metodología propia del autor, pero ninguno de estos datos está documentado en la información disponible. Tampoco se especifica si se trata de un transformer denso o de una arquitectura con mezcla de expertos (MoE); el recuento de parámetros activos no figura en el repositorio.

Respecto al entrenamiento, no se han publicado detalles sobre el número de tokens, la composición del dataset, el uso de RLHF, DPO u otras técnicas de alineación, ni sobre innovaciones como decodificación especulativa o atención lineal. El nombre "soup3" podría aludir a una fusión de pesos (model soup) de tres componentes, pero es una inferencia no confirmada. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa y, por tanto, se omite.

## Capacidades

- Generación de texto: capacidad esperable en un modelo de 31B, pero no documentada explícitamente.
- Razonamiento, código y matemáticas: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Capacidad de contexto largo: no disponible (longitud de contexto no especificada).

## Casos de uso

Dado que no se documentan capacidades específicas ni contexto, los casos de uso son potenciales y requieren validación empírica por parte del usuario:

- Evaluación comparativa de modelos de 31B: serviría como candidato en pruebas internas de calidad frente a otros modelos de tamaño similar, siempre que se valide su comportamiento en las tareas objetivo.
- Fine-tuning específico de dominio: al distribuirse en safetensors con licencia Apache 2.0, puede ajustarse con frameworks como Hugging Face Transformers o PEFT sobre datos propios, aunque el coste de cómputo para 31B es elevado.
- Investigación sobre fusionado de modelos: el nombre "soup3" lo hace interesante para estudiar técnicas de model soup y comparar el efecto del promediado de pesos en el rendimiento final.
- Despliegue experimental en clústeres con GPUs de alta memoria: un modelo de 31B en precisión completa requiere hardware de gama alta; podría probarse en entornos controlados antes de comprometerse a producción.
- Generación de texto general en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita su uso comercial, pero la falta de documentación obliga a auditar sesgos y calidad antes de integrarlo.
- Base para pipelines de cuantización y despliegue eficiente: al estar en safetensors, puede convertirse a GGUF u otros formatos para probar su viabilidad en hardware de consumo, aunque no se garantiza que el autor haya validado estas conversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 62,6 GB solo de pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB de VRAM para un despliegue cómodo.
- VRAM estimada en cuantización de 8 bits: en torno a 31-35 GB, viable en GPUs como A100 40GB o H100.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en RTX 4090 (24 GB) o RTX A6000 (48 GB), aunque no hay confirmación de que el modelo funcione correctamente tras cuantizar.
- GPUs recomendadas: A100 80GB, H100 80GB, o múltiples GPUs menores con paralelismo de tensor.
- Cabe en GPU de consumo: posiblemente en RTX 4090 con cuantización agresiva (4 bits), sin datos de latencia ni calidad tras cuantizar.
- Opciones de despliegue: vLLM, TGI o Transformers para safetensors; llama.cpp u Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| reax-g2-soup3 | 31,27B | no disponible | Apache 2.0 | safetensors | gated en HF |
| Gemma 2 27B | 27B | 8K (no confirmado en esta ficha) | Gemma license | safetensors, GGUF | pública |
| Mistral Large / modelos 30B clase | ~30B | variable | variable | variable | variable |

La comparativa con alternativas concretas no puede completarse con rigor porque no se dispone de datos de rendimiento del modelo. Se recomienda contrastar directamente con modelos de tamaño similar de la familia Gemma, Qwen o Mistral, pero los valores de dichos modelos no se incluyen aquí para no introducir datos no verificados en esta ficha.

## Limitaciones y advertencias

- Documentación inexistente: no hay model card con detalles de entrenamiento, datos, evaluación ni uso previsto; esto impide auditar sesgos y calidad.
- Riesgo de alucinación: desconocido, pero inherente a los modelos generativos sin evaluación publicada.
- Idiomas: no se especifican, por lo que no puede garantizarse un rendimiento multilingüe.
- Contexto: no se indica la longitud máxima, lo que impide planificar aplicaciones con ventanas largas.
- Licencia: Apache 2.0 permite uso comercial, pero el acceso está restringido (gated) y el usuario debe aceptar las condiciones en Hugging Face.
- Procedencia: el tag "gemma4" sugiere una posible base Gemma; conviene verificar la licencia y los términos de la familia original antes de un uso comercial, ya que las licencias de modelos derivados pueden arrastrar obligaciones adicionales.
- Producción: sin benchmarks ni validación externa, no se recomienda su uso en producción sin una evaluación previa exhaustiva.
- Cómputo: 31B parámetros exigen hardware significativo; el coste de inferencia y fine-tuning es alto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/danyloooah/reax-g2-soup3
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
