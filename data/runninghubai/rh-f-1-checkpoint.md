# RunningHubAI/rh-f.1-checkpoint

## Resumen

rh-f.1-checkpoint es un checkpoint de difusion para generacion de imagenes, publicado por RunningHubAI en Hugging Face y pensado para su uso dentro de ComfyUI y de la plataforma RunningHub. No es un modelo de lenguaje: es un modelo de texto a imagen orientado a la generacion de retratos de personajes, con especial enfasis en rostros de ascendencia asiatica oriental, cabello dinamico y texturas de ropa. El autor del checkpoint aparece identificado como NINE.JIUGE dentro de la plataforma RunningHub, y el modelo se distribuye como un unico fichero safetensors de aproximadamente 11,9 GB.

La model card describe un modelo afinado a partir de una base denominada "F1基础 D" (F1 base D) y recomienda un valor de CFG de 3.5. El modelo esta entrenado para interpretar descripciones textuales detalladas y traducirlas en retratos realistas o estilizados, con control sobre rasgos faciales, color y dinamica del pelo, color de ojos, expresion y prendas de vestir. Tambien declara capacidad de adaptarse a estilos ilustrados, semirrealistas o artisticos concretos (anime, pintura al oleo) a partir del prompt.

No se dispone de informacion publica sobre arquitectura interna, numero de parametros, longitud de contexto textual, datos de entrenamiento ni resultados de benchmarks. La informacion disponible se limita a la model card, a los metadatos de Hugging Face y al listado de ficheros del repositorio, por lo que muchos campos de esta ficha se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de difusion para texto a imagen, uso en ComfyUI) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye como safetensors de precision completa del checkpoint) |
| Idiomas soportados | no disponible (prompts en texto; la model card esta en ingles y chino) |
| Licencia | no disponible; la model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors |
| Tamano del repositorio | 11,9 GB |
| Fichero de pesos | `超写实精致亚洲女性肖像大模F.1.safetensors` (11.350 MiB) |
| Modelo base | F1基础 D (finetune) |
| CFG recomendado | 3.5 |
| Plataformas de uso | ComfyUI, RunningHub, Hugging Face |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo. Por el tipo de fichero (un unico checkpoint safetensors de unos 11,9 GB), por las etiquetas `comfyui` y `checkpoint` y por el formato de la model card, se trata de un modelo de difusion texto a imagen, no de un transformer de lenguaje. La model card no detalla el backbone (U-Net o DiT), el text encoder asociado, el VAE ni la resolucion nativa de entrenamiento.

El modelo se presenta como un finetune de una base llamada "F1基础 D", sin que se especifiquen el volumen de datos, la composicion del dataset, el uso de tecnicas como RLHF, DPO o fine-tuning supervisado, ni si hubo entrenamiento con preferencias humanas. La model card unicamente describe el comportamiento esperado en inferencia (CFG 3.5, enfasis en retratos, pelo y ropa) y enlaza a la plataforma RunningHub para el entrenamiento de modelos, sin aportar detalles tecnicos del proceso seguido con este checkpoint.

## Capacidades

- Generacion de imagenes de retrato a partir de descripciones textuales detalladas (texto a imagen).
- Reproduccion de rasgos faciales de ascendencia asiatica oriental, incluyendo forma de la cara y proporcion de facciones.
- Control de atributos capilares: color (por ejemplo, marron oscuro), estilo (pelo largo y liso, peinado hacia atras y cayendo sobre los hombros) y dinamica del cabello.
- Control de color de ojos, color de cejas, color de labios y expresiones sutiles (por ejemplo, una sonrisa leve).
- Generacion de prendas y detalles de vestuario, con comprension de materiales basicos, cuellos y puños.
- Composicion de primer plano centrada en rostro y parte superior del cuerpo, con control de fondos simples (por ejemplo, gris claro).
- Adaptabilidad estilistica: realismo, ilustracion, semirrealismo, anime o pintura al oleo segun el prompt.
- Uso integrado en flujos de ComfyUI y en la plataforma RunningHub.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo de pensamiento, al no tratarse de un modelo de lenguaje.

## Casos de uso

- Generacion de retratos para ficcion y narrativa visual: el modelo permite describir en el prompt rasgos faciales, color y estilo del pelo y vestuario, y obtener un retrato coherente en primer plano, adecuado para ilustrar personajes de relatos o guiones.
- Creacion de avatares y personajes consistentes para prototipos de producto: con CFG 3.5 y descripciones detalladas se pueden generar variaciones de un mismo personaje (mismo peinado, mismo color de ojos, misma prenda) para maquetas de interfaz o presentaciones.
- Ilustracion editorial y de moda estilizada: el control sobre prendas, cuellos, puños y materiales permite generar bocetos de vestuario o ilustraciones de articulos sobre tendencias, ajustando el estilo entre realista e ilustrado.
- Pruebas de concepto en estudios de videojuegos o animacion: el modelo sirve para explorar direcciones de diseno de personajes (color de pelo, expresion, encuadre) antes de pasar a modelado o ilustracion final.
- Generacion de imagenes para contenido en redes o marketing: retratos con fondo simple y foco en el rostro, utiles para piezas graficas donde se busca un sujeto claro y sin distracciones de fondo.
- Flujos automatizados en ComfyUI: al ser un checkpoint compatible con ComfyUI, se puede encadenar con nodos de upscaling, control de composicion o postprocesado para producir lotes de retratos dentro de un pipeline grafico.
- Experimentacion con estilos artisticos: la model card indica que el modelo puede generar retratos en estilo anime, semirrealista o pintura al oleo, lo que permite usarlo para explorar variaciones estilisticas de un mismo concepto.
- Integracion via API de RunningHub: para equipos que no quieran desplegar el modelo localmente, la plataforma ofrece llamadas API y ejecucion en la nube, util para generar imagenes bajo demanda desde una aplicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un checkpoint safetensors de 11,9 GB en precision de 16 bits requiere del orden de 12 GB o mas de VRAM solo para los pesos, a los que se suman el text encoder, el VAE y las activaciones durante la generacion.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por el tamano del checkpoint, serian necesarias GPU con al menos 16-24 GB de VRAM para trabajar con comodidad; no se confirma compatibilidad con GPUs de consumo concretas.
- Cabe en GPU de consumo: no confirmado. Un checkpoint de este tamano esta en el limite de tarjetas consumer de gama alta; no hay datos oficiales que lo verifiquen.
- Opciones de despliegue: ComfyUI (plataforma indicada por el autor), la plataforma RunningHub (ejecucion en la nube y API) y carga directa del safetensors en Hugging Face. No se documentan otros runners como vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento, parametros ni contexto de otros modelos de texto a imagen, por lo que no es posible establecer una comparativa rigurosa con alternativas de la misma categoria.

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos del modelo. Al estar especializado en retratos de ascendencia asiatica oriental y en un rango concreto de atributos (pelo marron oscuro, ojos azules en el ejemplo, tez clara), puede reproducir sesgos de representacion si se usa fuera de ese dominio.
- Riesgo de alucinacion visual: como todo modelo generativo de imagen, puede producir detalles anatomicos incorrectos (manos, joyas, texto en la ropa) o incoherencias entre el prompt y la imagen, especialmente con descripciones muy complejas.
- Limitaciones de idioma y de prompt: no se especifican los idiomas soportados para los prompts; la model card esta en ingles y chino, y no hay garantia de buen rendimiento con prompts en castellano.
- Restricciones de licencia: la licencia no esta declarada de forma explicita. La model card indica que los derechos pertenecen al autor y que debe seguirse la licencia del proyecto original o upstream, lo que introduce incertidumbre para uso comercial. Es necesario verificar la licencia de la base "F1基础 D" antes de desplegar en produccion.
- Dependencia de la plataforma: el modelo se publica para usarse en ComfyUI y RunningHub; no se documenta soporte para otros ecosistemas ni herramientas de conversion.
- Ausencia de datos tecnicos: sin arquitectura, parametros, contexto ni benchmarks publicados, la evaluacion previa a produccion debe hacerse con pruebas propias.
- Fecha de publicacion futura en los metadatos (2026-11-05): conviene tratar las fechas del repositorio con cautela.
- El repositorio no registra descargas ni likes en el momento de la consulta, lo que limita la evidencia externa sobre su calidad y estabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-f.1-checkpoint
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2015729434459901954
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1958026340350025729
- RunningHub (internacional): https://www.runninghub.ai
- RunningHub (China): https://www.runninghub.cn
- Documentacion de la API de RunningHub (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API de RunningHub (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- README en chino: https://huggingface.co/RunningHubAI/rh-f.1-checkpoint/blob/main/README_cn.md
