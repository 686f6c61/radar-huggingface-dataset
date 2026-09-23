# kato96/Viggle-Animate-ComfyUI

## Resumen
Viggle-Animate-ComfyUI (kato96) es un paquete de conversiones nativas para ComfyUI de los pesos de Viggle-Animate, un fine-tune completo de 33,1 B parámetros del transformer `ref2va` de MiniMax-H3 orientado a reemplazo de personaje en vídeo. El modelo toma un clip conductor —que aporta movimiento, cámara, fondo e iluminación— y una única imagen de referencia que define la identidad del personaje; no hay codificador de texto, ya que el condicionamiento se resuelve con un embedding congelado de 362 tokens.

Su relevancia práctica está en el formato: el autor publica los pesos ya convertidos al ecosistema ComfyUI en tres variantes (bf16, int8 y int8 podada), junto con un LoRA acelerador destilado con DMD2 que reduce el muestreo a 4 pasos (3 pasadas forward), lo que rebaja de forma drástica el coste de inferencia frente a un modelo de difusión de vídeo sin destilar. El repositorio ocupa 139,1 GB e incluye los componentes auxiliares (VAE de vídeo y condicionamiento de texto precalculado).

Es, por tanto, una ficha de herramienta de postproducción y generación de vídeo, no de un modelo de lenguaje: no hay generación de texto, razonamiento ni tool calling. El nicho es la transferencia de movimiento y el intercambio de identidad en vídeo desde una sola imagen, con licencia comunitaria de MiniMax H3 que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión vídeo-a-vídeo (`ref2va` de MiniMax-H3), fine-tune completo; sin codificador de texto |
| Parámetros totales | 33,1 B |
| Parámetros activos | no disponible (no se especifica si la arquitectura base es MoE) |
| Longitud de contexto | no disponible (no aplica: el condicionamiento es un embedding congelado de 362 tokens, no una ventana de contexto autorregresiva) |
| Tipos de cuantización | bf16 (66,3 GB), int8 convrot (47 GB), int8 convrot podada (21 GB); VAE en int8 convrot (3,17 GB) o fp16 (5,21 GB) |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement); los pesos son una obra derivada del modelo base |
| Formato de pesos | safetensors (modelo de difusión, LoRA, VAE y condicionamiento de texto); integración mediante ComfyUI |
| Pipeline declarado | video-to-video |
| Pasos de muestreo | 4 pasos / 3 pasadas forward con el LoRA DMD2 (rango completo: 4-8 pasos) |
| Resolución probada | lienzo de 0,4 a 0,98 MP; cada eje se redondea a múltiplos de 32 |
| Tamaño del repositorio | 139,1 GB |
| Autor / fecha | kato96, creado y actualizado el 2026-09-23 |

## Arquitectura y entrenamiento
El modelo es un transformer de difusión para generación de vídeo condicionada, derivado del `ref2va` de MiniMax-H3 y sometido a un fine-tune completo de 33,1 B parámetros por parte de Viggle Research. La particularidad del diseño es la ausencia total de codificador de texto: el condicionamiento se inyecta como un embedding congelado de 362 tokens (`fixed_embed_fwd_anyframe.safetensors`), que se carga con un nodo específico de ComfyUI. La señal visual llega por dos vías: el clip conductor, del que se heredan movimiento, cámara, fondo e iluminación, y la imagen de referencia, que fija la identidad del personaje.

Sobre el entrenamiento, la información disponible no detalla el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO; esos datos figuran como no disponibles. Lo que sí se documenta es el proceso de destilación: se publica un LoRA DMD2 (dos variantes, r64 de 0,94 GB y rango completo de 3,8 GB) que permite muestrear en 4 pasos con 3 pasadas forward, usando el sampler de MiniMax-H3 con `shift 3.0`. Las conversiones aplican cuantización int8 con esquema convrot, lo que reduce el peso del transformer de 66,3 GB en bf16 a 21 GB en la variante podada.

## Capacidades
- Reemplazo de personaje en vídeo: sustituye la identidad del sujeto del clip conductor por la de la imagen de referencia, manteniendo movimiento y encuadre.
- Transferencia de movimiento y baile: reproduce coreografías y desplazamientos del clip conductor sobre el personaje de referencia.
- Conservación del entorno: fondo, cámara e iluminación proceden del vídeo conductor, no se regeneran por prompt de texto.
- Condicionamiento sin texto: no requiere prompt ni codificador de texto; el control semántico se limita a la imagen de referencia y al clip.
- Control de resolución: la salida sigue el clip conductor por defecto o se fija manualmente en los ejes ancho y alto (redondeo a múltiplos de 32).
- Muestreo acelerado: inferencia en 4 pasos con el LoRA DMD2, con soporte de samplers euler, er_sde, exp_heun_2_x0, lcm, simple, normal, beta y bong_tangent.
- Integración en ComfyUI: nodos propios de condicionamiento, compatibilidad declarada con Comfy Kitchen y parches de atención dispersa por bloques.
- Generación de audio: no documentada en esta conversión, aunque el modelo base MiniMax-H3 incluye un VAE de audio.
- Tool calling, agentes, razonamiento multi-paso, matemáticas y capacidades multilingües: no aplicables, no es un modelo de lenguaje.

## Casos de uso
- Sustitución de dobles en producción audiovisual: el clip rodado con un especialista aporta la acción y la cámara, y la cara del actor principal se introduce desde una única fotografía, evitando rodar de nuevo las secuencias de riesgo.
- Previsualización con el reparto final: durante la previz se rueda con maniquíes o con el equipo, y el modelo genera el plano con los actores definitivos para validar encuadre y continuidad antes del rodaje real.
- Vídeo musical y coreografía: se graba al bailarín y se transfiere la coreografía a la imagen del artista, con control del lienzo entre 0,4 y 0,98 MP para ajustar el coste por plano.
- Personalización de campañas publicitarias: un mismo clip conductor se reutiliza con distintas imágenes de referencia para producir variantes de anuncio por mercado o por embajador de marca, reduciendo a segundos el coste de la pasada de 4 pasos.
- Avatares de marca y contenido para redes: animar un retrato corporativo o un personaje ilustrado a partir de un clip de referencia, con salida a 24 fps forzando `force_rate` en el nodo de carga de vídeo.
- Corrección de continuidad en reshoots: cuando un actor no está disponible, se regenera el plano manteniendo el metraje ya rodado como conductor, siempre que el sujeto no salga y reentre en el encuadre (limitación documentada de deriva de identidad).
- Preservación de material de archivo: aplicar la coreografía o el movimiento de un clip antiguo a un personaje actual sin volver a rodar, conservando iluminación y atrezzo originales.
- Anonimización con consentimiento: sustituir rostros por una identidad sintética en material rodado, etiquetando la salida como generada por IA y contando con autorización explícita de las personas implicadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La model card únicamente incluye cuatro vídeos de ejemplo (00000_00006.mp4, 00000_00007.mp4, 00000_00009.mp4 y 00000_00013.mp4) y una captura de la interfaz del workflow, sin métricas cuantitativas de calidad, FVD, consistencia de identidad ni tiempos de inferencia.

## Requisitos de hardware
- No hay cifras oficiales de VRAM publicadas por el autor; las estimaciones siguientes se derivan del tamaño de los ficheros de pesos y deben tomarse como orientativas.
- Variante bf16 (66,3 GB de pesos): requiere GPU de 80 GB (A100 80 GB, H100 80 GB) con margen para activaciones, o despliegue con offload a CPU, penalizando la latencia.
- Variante int8 completa (47 GB): cabe en A100 80 GB o H100; en dos RTX 4090/3090 de 24 GB requiere reparto y offload cuidadoso.
- Variante int8 podada (21 GB): es la opción pensada para VRAM limitada; entra en una RTX 3090 o RTX 4090 de 24 GB dejando poco margen para el VAE y las activaciones de vídeo, por lo que se recomienda cargar el VAE int8 y usar offload.
- Añadir el VAE (3,17 GB en int8 o 5,21 GB en fp16), el LoRA DMD2 (0,94 GB en r64) y el condicionamiento precalculado.
- Despliegue: ComfyUI con los nodos ComfyUI-Viggle-Animate-H3 (condicionamiento y carga de texto) y ComfyUI-KJNodes (previsualización rápida). Stacks con Comfy Kitchen y parches de atención dispersa por bloques.
- No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de difusión de vídeo, estos servidores no aplican.
- Latencia y throughput: no disponibles. El único dato de coste computacional publicado es que el muestreo destilado requiere 4 pasos y 3 pasadas forward.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Resolución / condición | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kato96/Viggle-Animate-ComfyUI | Conversión ComfyUI de un modelo de difusión vídeo-a-vídeo | 33,1 B | 0,4-0,98 MP; imagen de referencia + clip conductor | safetensors bf16/int8/int8 podada + LoRA | minimax-h3-community-license | Repositorio de 139,1 GB; requiere nodos custom de ComfyUI |
| Viggle/Viggle-Animate | Modelo original con código de inferencia | 33,1 B | Iguales (imagen de referencia + clip conductor) | safetensors (no cuantizado en origen) | minimax-h3-community-license | Publicado por Viggle Research; sin conversión a ComfyUI |
| MiniMaxAI/MiniMax-H3 | Modelo base de la familia | no disponible | no disponible | safetensors | minimax-h3-community-license | Modelo base; de él proceden los VAE (vídeo y audio) usados aquí |
| Otras herramientas de reemplazo de personaje | no disponible | no disponible | no disponible | no disponible | no disponible | No hay datos comparables en la información proporcionada |

## Limitaciones y advertencias
- Deriva de identidad en reentradas: cuando el sujeto sale del encuadre y vuelve, la generación tiende a recaer en la apariencia del vídeo conductor en lugar de la imagen de referencia.
- Cuanto más se aleja la pose del sujeto del still de referencia, o ante movimientos abruptos (por ejemplo, un mortal hacia atrás), menor es la fidelidad de la identidad.
- Rango de resolución validado estrecho: entre 0,4 y 0,98 MP; fuera de ese intervalo el comportamiento no está documentado.
- Dependencia de nodos de terceros no oficiales, con riesgo de rotura del workflow ante cambios en ComfyUI o en los repositorios de nodos.
- Restricciones de licencia: los pesos son una obra derivada de MiniMax H3 y quedan sujetos a la MiniMax H3 Community License Agreement, que debe leerse antes de redistribuir o comercializar un producto basado en ellos.
- Uso ético obligatorio según la propia model card: no ejecutar el modelo sobre personas sin su consentimiento y etiquetar toda salida como generada por IA. Riesgo claro de deepfakes y suplantación de identidad.
- Sesgos: no se documenta información sobre sesgos demográficos, de género, de tono de piel o de composición del dataset de entrenamiento.
- Riesgo de artefactos: no hay métricas publicadas de calidad, estabilidad temporal ni consistencia entre fotogramas, por lo que la fiabilidad en producción debe validarse internamente.
- Discrepancia de autoría: el repositorio documentado es kato96/Viggle-Animate-ComfyUI, pero todos los enlaces de descarga de pesos de la model card apuntan a drbaph/Viggle-Animate-ComfyUI; la relación entre ambas cuentas no está documentada.
- Idoneidad del hardware: la variante bf16 (66,3 GB de pesos) no cabe en GPU de consumo, y la variante podada de 21 GB en 24 GB deja muy poco margen para activaciones de vídeo.

## Enlaces
- Repositorio documentado: https://huggingface.co/kato96/Viggle-Animate-ComfyUI
- Modelo original e inferencia: https://huggingface.co/Viggle/Viggle-Animate
- Modelo base de la familia: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Nodos de ComfyUI requeridos: https://github.com/Saganaki22/ComfyUI-Viggle-Animate-H3
- Incidencias sobre pesos y conversiones: https://github.com/Saganaki22/ComfyUI-Viggle-Animate-H3/issues
- Nodos ComfyUI-KJNodes: https://github.com/kijai/ComfyUI-KJNodes
- VAE de vídeo int8 (Kijai): https://huggingface.co/Kijai/MiniMax-H3-experimental
- VAE de vídeo fp16 (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Pesos referenciados en la model card (cuenta drbaph): https://huggingface.co/drbaph/Viggle-Animate-ComfyUI
