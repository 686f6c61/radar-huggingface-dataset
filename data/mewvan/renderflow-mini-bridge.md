# mewvan/renderflow-mini-bridge

## Resumen

RenderFlow-mini-bridge es un modelo de renderizado neuronal condicional desarrollado por el usuario mewvan y publicado en Hugging Face. Se trata de una reproducción a escala reducida del trabajo RenderFlow: Single-Step Neural Rendering via Flow Matching (Zhang et al., CVPR 2026), y su objetivo es transformar mapas de albedo en imagenes completamente sombreadas mediante un esquema de flow matching en un unico paso. No es un modelo de lenguaje, sino un modelo de vision generativa orientado a la sintesis de imagenes fotorrealistas a partir de buffers de geometria y materiales.

La arquitectura es una UNet condicional de aproximadamente 22 millones de parametros que opera en espacio de pixeles a resolucion 256x256. El modelo se entrena con Brownian-bridge matching, una variante de flow matching que conecta la distribucion de albedo con la de imagenes finales mediante un puente estocastico con sigma=0.005. La condicion incluye albedo, normales, profundidad y un HDRI con tonemapping, inyectados mediante capas FiLM.

Su relevancia radica en que consigue resultados competitivos (25,50 dB PSNR con una sola evaluacion de la red) con una latencia de 20,1 ms por fotograma en una GPU A10G, lo que lo hace atractivo para pipelines de renderizado en tiempo real o previsualizacion interactiva. El repositorio ocupa 0,1 GB y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet condicional (espacio de pixeles, 256x256) |
| Parametros totales | ~22 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es una UNet condicional que opera directamente en espacio de pixeles a 256x256, sin VAE ni codificador latente. La entrada condicional combina albedo, normales, profundidad y un HDRI con tonemapping, todos ellos inyectados mediante capas FiLM (Feature-wise Linear Modulation). La salida es la imagen completamente sombreada correspondiente a la escena.

El entrenamiento utiliza Brownian-bridge matching con sigma=0.005, combinando un schedule discreto de 4 pasos con una mezcla uniforme en t. Se realizaron 15.000 micro-pasos con batch efectivo de 32, optimizador AdamW con learning rate 1e-4 y autocast en bf16. Ademas de la perdida de flow matching, se anadieron perdidas de pixel basadas en LPIPS y en gradientes con peso lambda=1. Los datos de entrenamiento provienen del dataset mewvan/renderflow-mini-dataset, compuesto por escenas procedurales de Mitsuba. La innovacion principal es la formulacion de puente estocastico, que permite generar una imagen sombreada en un unico paso de inferencia manteniendo una calidad cercana a la de esquemas multi-paso.

## Capacidades

- Renderizado neuronal condicional: transforma albedo en imagen completamente sombreada en un unico paso de red.
- Condicionamiento multimodal de buffers: acepta albedo, normales, profundidad y HDRI tonemapeado como entradas.
- Generacion determinista: la variacion entre ejecuciones identicas es de solo ±0,16 dB PSNR, atribuible a ruido de kernels GPU, sin estocasticidad de muestreo.
- Inferencia en 1 paso o 4 pasos (Euler), con calidad ligeramente superior en el modo de 4 pasos.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.
- No dispone de modo thinking, vision general, audio ni otras capacidades fuera del renderizado condicional.

## Casos de uso

- Previsualizacion interactiva de escenas 3D: el modelo permite obtener una imagen sombreada aproximada en 20,1 ms por fotograma en una A10G, lo que habilita visores en tiempo real con retroalimentacion visual inmediata mientras el artista ajusta materiales e iluminacion.
- Renderizado de baja latencia en pipelines de produccion: con 78,4 ms por fotograma en modo de 4 pasos, puede integrarse como etapa de sombreado rapido en flujos de trabajo que requieran previsualizaciones de alta fidelidad antes del render final.
- Generacion de variaciones de iluminacion: al condicionar sobre HDRI tonemapeado, permite explorar distintas condiciones de iluminacion sobre un mismo conjunto de albedo, normales y profundidad sin re-renderizar la geometria.
- Prototipado de shaders y materiales: los artistas tecnicos pueden evaluar el aspecto de un material (albedo) bajo una iluminacion dada sin esperar a un motor de render fisico completo.
- Aumento de datos para vision por computador: el modelo puede generar pares albedo-imagen sombreada sinteticos y diversos para entrenar modelos de estimacion de iluminacion o de materiales.
- Investigacion en flow matching aplicado a graficos: sirve como reproduccion a escala reducida y reproducible del metodo RenderFlow, util para experimentar con variantes de schedule, condicionamiento o perdidas sin requerir los recursos del modelo original.
- Validacion de pipelines de renderizado: al ser determinista y tener una latencia baja, puede usarse como referencia rapida para comparar configuraciones de escenas procedurales en Mitsuba.

## Benchmarks y rendimiento

Resultados sobre 300 fotogramas de escenas procedurales de Mitsuba no vistas durante el entrenamiento (seed 0):

| Inferencia | PSNR | SSIM | LPIPS | Latencia por fotograma |
|---|---|---|---|---|
| 1 paso | 25,50 dB | 0,796 | 0,230 | 20,1 ms (A10G) |
| 4 pasos (Euler) | 25,66 dB | 0,810 | 0,231 | 78,4 ms (A10G) |

La determinacion entre ejecuciones identicas es de ±0,16 dB PSNR, atribuible a ruido de kernels GPU y no a estocasticidad del muestreo. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con ~22M parametros en bf16 el peso del modelo ronda los 44 MB, por lo que la VRAM necesaria sera muy reducida y dominada por los buffers de activacion a 256x256.
- GPU recomendadas: el autor reporta latencias en una NVIDIA A10G; por el tamano del modelo, es previsible que quepa en GPUs de consumo como RTX 3060, RTX 4060 o superiores, aunque no se han publicado mediciones en esas tarjetas.
- Cabe en GPU de consumo: si, segun el tamano de parametros, aunque no hay benchmarks publicados que lo confirmen.
- Opciones de despliegue: no se especifican en la informacion disponible; el formato de pesos no esta documentado, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, en cualquier caso).
- Latencia y throughput: 20,1 ms por fotograma en 1 paso y 78,4 ms en 4 pasos sobre A10G, equivalente a aproximadamente 49,8 y 12,8 fotogramas por segundo respectivamente.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de renderizado neuronal comparables, ni resultados cruzados con el modelo original RenderFlow a escala completa.

## Limitaciones y advertencias

- Modelo de vision especializado: no es un modelo de lenguaje ni un modelo multimodal general; no debe evaluarse con benchmarks de texto, codigo o razonamiento.
- Resolucion fija: opera a 256x256 en espacio de pixeles, lo que limita su uso directo en produccion a alta resolucion sin etapas adicionales de superresolucion o mosaico.
- Dominio de entrenamiento restringido: entrenado sobre escenas procedurales de Mitsuba, por lo que su generalizacion a escenas reales o capturas del mundo fisico no esta validada.
- Calidad limitada: 25,50 dB PSNR y 0,230 LPIPS indican una fidelidad moderada; no sustituye a un renderizador fisico para imagenes finales de alta calidad.
- Dependencia de buffers de entrada: requiere albedo, normales, profundidad y HDRI tonemapeado correctamente alineados; errores en estas entradas degradaran la salida.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero exige citar al autor y la licencia; conviene revisar los terminos exactos antes de integrarlo en productos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema minimo, sin validacion externa ni comunidad que reporte problemas.
- Formato de pesos no documentado: puede requerir trabajo adicional para integrarlo en frameworks de inferencia estandar.
- Riesgo de alucinacion visual: como modelo generativo, puede producir detalles plausibles pero incorrectos en regiones con poca informacion condicional (oclusiones, superficies especulares complejas).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mewvan/renderflow-mini-bridge
- Dataset de entrenamiento: https://huggingface.co/datasets/mewvan/renderflow-mini-dataset
- Paper de referencia (RenderFlow, Zhang et al., CVPR 2026): https://arxiv.org/abs/2601.06928
- Informe del autor (bucket mewvan/renderflow-mini): referenciado en la model card como `mewvan/renderflow-mini` bucket README, sin URL directa disponible.
