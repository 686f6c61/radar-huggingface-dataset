# hamzah0asadullah/Schauspieler-1B

## Resumen

Schauspieler-1B es un modelo de lenguaje publicado por el usuario hamzah0asadullah en Hugging Face bajo licencia Apache 2.0. A pesar del sufijo "1B" en su nombre, los pesos en formato safetensors suman 752.393.024 parametros, es decir, aproximadamente 0,75 mil millones. El modelo se etiqueta con la arquitectura `qwen3_5_text`, lo que sugiere que deriva de la familia Qwen 3.5 en su variante exclusivamente de texto, aunque no se aporta documentacion que lo confirme.

La model card publicada es practicamente vacia: unicamente incluye la declaracion de licencia Apache 2.0, sin descripcion, sin datos de entrenamiento, sin benchmarks ni instrucciones de uso. El repositorio ocupa 1,5 GB y no registra descargas ni interacciones en el momento de la consulta, lo que indica un lanzamiento muy reciente (creado y actualizado el 18 de noviembre de 2026) y sin validacion por parte de la comunidad.

Por tanto, esta ficha se limita a los datos verificables del repositorio (parametros, formato, licencia y arquitectura declarada) y marca explicitamente como no disponibles todos aquellos aspectos que el autor no ha documentado. Cualquier evaluacion de calidad, rendimiento o idoneidad para produccion queda pendiente de una validacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_text (transformer decoder-only, segun etiqueta del repositorio) |
| Parametros totales | 752.393.024 (aproximadamente 0,75 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se incluyen GGUF ni cuantizaciones precalculadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,5 GB |
| Pipeline declarado | no disponible |
| Region | us |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo con la arquitectura `qwen3_5_text`, lo que apunta a un transformer decoder-only de la familia Qwen 3.5 en su variante de solo texto. El numero de parametros (752 millones) es coherente con un modelo pequeno de esa familia, pero no se dispone de informacion sobre el numero de capas, dimensiones ocultas, cabezas de atencion, tipo de atencion (completa, lineal o hibrida) ni vocabulario.

No hay datos publicados sobre el corpus de entrenamiento: ni numero de tokens, ni composicion del dataset, ni si hubo fases de ajuste supervisado, RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento extendido. Toda esta seccion queda marcada como no disponible a la espera de que el autor publique una model card completa o de que la comunidad realice una evaluacion tecnica.

## Capacidades

- Generacion de texto: capacidad esperable por tratarse de un modelo de lenguaje, aunque no hay evaluacion publicada que lo confirme.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

Dado que no existe documentacion sobre el rendimiento ni las capacidades reales del modelo, los siguientes casos son escenarios potenciales que requeririan validacion previa con evaluaciones propias:

- Prototipado local en entornos con recursos limitados: con 752 millones de parametros, el modelo puede ejecutarse en GPUs de consumo y servir como banco de pruebas para pipelines de generacion de texto antes de escalar a modelos mayores.
- Experimentacion academica sobre modelos pequenos: util para estudiar tecnicas de ajuste fino (LoRA, QLoRA) o de cuantizacion sobre una base de aproximadamente 0,75 B de parametros.
- Generacion de texto auxiliar en aplicaciones de bajo riesgo: resumenes cortos o borradores, siempre con revision humana y tras validar la calidad real del modelo.
- Fine-tuning especifico de dominio: al estar bajo Apache 2.0, permite ajustar los pesos para tareas concretas (clasificacion de texto, extraccion de entidades) sin restricciones de uso comercial.
- Despliegue en el borde (edge) o en dispositivos con poca VRAM: el tamano reducido facilita la inferencia en CPU o en GPUs modestas mediante llama.cpp u Ollama, una vez convertido a GGUF.
- Base para investigacion sobre alineacion y seguridad: su licencia permisiva y su tamano manejable lo hacen adecuado para estudiar comportamientos de modelos pequenos en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,5 GB solo para los pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,8 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,4 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (por ejemplo, RTX 3050, RTX 4060, T4); para cuantizaciones de 4 bits basta con GPUs integradas o de gama baja.
- Cabe en GPU de consumo: si, con margen amplio en modelos como RTX 3060, RTX 4060, RTX 4090 o incluso en CPU con cuantizacion.
- Opciones de despliegue: vLLM o TGI para servido en GPU (pendiente de verificar compatibilidad con la arquitectura `qwen3_5_text`), llama.cpp u Ollama tras conversion a GGUF, y transformers con PyTorch para uso directo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Schauspieler-1B | 752 M | no disponible | Apache 2.0 | Hugging Face, sin descargas |
| Qwen2.5-0.5B | 494 M | 32 768 tokens | Apache 2.0 | Hugging Face, ampliamente validado |
| Qwen2.5-1.5B | 1,54 B | 32 768 tokens | Apache 2.0 | Hugging Face, ampliamente validado |
| SmolLM2-1.7B | 1,7 B | 8 192 tokens | Apache 2.0 | Hugging Face, ampliamente validado |

La comparativa se limita a parametros, contexto y licencia porque no existen datos de rendimiento publicados para Schauspieler-1B. Frente a las alternativas citadas, la diferencia principal es la ausencia de documentacion y de validacion comunitaria: los modelos de Qwen y SmolLM cuentan con model cards detalladas, benchmarks publicados y ecosistema de cuantizaciones.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, sesgos, idiomas ni rendimiento, lo que impide evaluar su idoneidad para cualquier caso de produccion.
- Riesgo de alucinacion: al no existir evaluaciones, no puede descartarse un comportamiento deficiente en tareas de factualidad, especialmente en un modelo de este tamano.
- Sesgos desconocidos: sin documentacion sobre la composicion del corpus, no es posible anticipar sesgos de genero, idioma o dominio.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto real y los idiomas soportados; el nombre del modelo sugiere un posible enfoque en aleman, pero no esta confirmado.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el usuario asume toda la responsabilidad sobre el comportamiento del modelo al no haber garantias del autor.
- Sin cuantizaciones oficiales ni pipeline declarado: sera necesario convertir los pesos a GGUF o verificar la compatibilidad con los frameworks de inferencia, lo que anade trabajo de integracion.
- Cero traccion en la comunidad: sin descargas ni likes, no existe retroalimentacion que permita detectar problemas de calidad o de implementacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hamzah0asadullah/Schauspieler-1B
- Paper, blog o repositorio adicional: no disponible
- Demo: no disponible
