# mradermacher/WeMM-Ecom-2B-GGUF

## Resumen

WeMM-Ecom-2B es un modelo multimodal orientado a conversaciones de comercio electronico, desarrollado originalmente por Tencent y publicado bajo licencia Apache 2.0. Esta ficha corresponde a la version cuantizada en formato GGUF elaborada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. El modelo base se etiqueta internamente como derivado de la familia Qwen 3.5, lo que sugiere una arquitectura transformer multimodal con capacidades de comprension de imagen y texto.

El modelo esta disenado especificamente para el dominio del comercio electronico: atencion al cliente, descripcion de productos, conversaciones multi-turno con soporte de imagenes de articulos y consultas en chino e ingles. Su tamano reducido (331 millones de parametros segun los pesos en safetensors del modelo base) lo hace adecuado para despliegues con recursos limitados, aunque conviene senalar que el nombre comercial "2B" no coincide con el recuento real de parametros publicado.

La relevancia de esta ficha radica en que ofrece una via practica para probar el modelo en local sin necesidad de GPU de datacenter: los cuantizados estaticos en GGUF van desde Q2_K hasta Q8_0, con ficheros multimodales separados (mmproj) para el procesamiento de imagenes. No obstante, la informacion publica disponible es muy escasa y no se han divulgado resultados de benchmarks ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiquetado como qwen3_5) |
| Parametros totales | 331.416.576 (pesos safetensors del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de las etiquetas del repositorio: se clasifica como multimodal y se asocia a la familia qwen3_5, lo que apunta a un transformer con un codificador visual acoplado a un modelo de lenguaje. El repositorio GGUF incluye ficheros mmproj separados, lo que confirma que el procesamiento de imagenes se realiza mediante un proyector multimodal independiente del cuerpo del modelo de lenguaje.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni innovaciones tecnicas especificas (atencion lineal, decodificacion especulativa, etc.). El autor de los cuantizados indica que no hay versiones con imatrix o cuantizacion ponderada disponibles en el momento de la publicacion, solo cuantizados estaticos.

## Capacidades

- Generacion de texto conversacional en chino e ingles.
- Comprension de imagenes mediante el proyector multimodal (mmproj), orientada a productos y contenido de comercio electronico.
- Conversaciones multi-turno en el dominio del comercio electronico (atencion al cliente, consultas de productos).
- Capacidad multimodal texto-imagen segun las etiquetas del modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en tiendas online: el modelo puede gestionar conversaciones multi-turno en chino e ingles sobre pedidos, devoluciones y caracteristicas de productos, aprovechando su especializacion en el dominio del comercio electronico.
- Descripcion automatica de productos a partir de imagenes: gracias al proyector multimodal, puede generar fichas de producto a partir de fotografias de articulos, reduciendo el trabajo manual de catalogacion.
- Asistente de compras conversacional: integrado en una web o aplicacion movil, puede responder dudas sobre articulos combinando texto e imagenes enviadas por el usuario.
- Moderacion y clasificacion de listados de e-commerce: puede analizar imagenes y texto de publicaciones para detectar contenido inadecuado o incoherencias entre foto y descripcion.
- Extraccion de atributos de producto: a partir de una imagen y una descripcion, el modelo puede ayudar a estructurar tallas, colores, materiales y categorias para bases de datos de catalogo.
- Prototipado local en equipos de desarrollo: al estar disponible en GGUF, permite probar flujos multimodales de comercio electronico en portatiles con llama.cpp u Ollama antes de invertir en infraestructura, dado su reducido tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los cuantizados Q4_K_M de un modelo de ~331 millones de parametros ocupan del orden de 0,2-0,3 GB; el fichero mmproj anade 0,5 GB (Q8_0) o 0,8 GB (f16). En total, un despliegue multimodal completo cabe holgadamente en menos de 2 GB de memoria.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es mas que suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF y mmproj (LM Studio, entre otros). El modelo base en safetensors puede usarse con transformers.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeMM-Ecom-2B (esta ficha, GGUF) | 331 M (safetensors) | no disponible | Si (mmproj) | Apache 2.0 | GGUF en HF |
| Qwen2-VL-2B | ~2 B | no disponible en esta ficha | Si | Apache 2.0 | safetensors, GGUF de terceros |
| SmolVLM-256M / 500M | 256-500 M | no disponible en esta ficha | Si | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a modelos multimodales de pequeno tamano con licencia permisiva; no se dispone de datos de rendimiento comparativo del modelo evaluado, por lo que la eleccion entre alternativas deberia basarse en pruebas propias en el dominio de comercio electronico.

## Limitaciones y advertencias

- Informacion publica muy escasa: no hay benchmarks, detalles de entrenamiento ni documentacion de contexto, lo que dificulta evaluar su calidad real.
- El nombre "2B" no coincide con el recuento de parametros en safetensors (331 M); conviene verificar el modelo base antes de dimensionar infraestructura.
- Solo se declaran idiomas chino e ingles; el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, especialmente en datos de producto y precios; requiere validacion en produccion.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia del modelo base original en el repositorio de Tencent.
- Los cuantizados son estaticos (sin imatrix), por lo que las versiones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- El procesamiento multimodal requiere cargar el fichero mmproj junto al modelo; no todos los runtimes lo soportan.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/WeMM-Ecom-2B-GGUF
- Modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B
- Licencia del modelo base: https://huggingface.co/tencent/WeMM-Ecom-2B/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#WeMM-Ecom-2B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Comparativa de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
