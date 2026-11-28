# JiayiWuLeo/FreeCHROMA

## Resumen

FreeCHROMA es un modelo generativo de chroma keying desarrollado por investigadores de la University of Maryland (College Park), Amazon y Arizona State University. Resuelve el problema del compositing de video en produccion audiovisual: dada una performance de primer plano enmascarada y entre una y tres imagenes de referencia de fondo no alineadas, genera un video compuesto donde el primer plano se integra de forma espacio-temporalmente coherente en el entorno referenciado, preservando identidad, movimiento y detalle fino del sujeto.

Tecnicamente es un adaptador LoRA sobre el modelo de difusion de video Wan2.2-Fun-A14B-Control de Alibaba PAI. La innovacion clave es que las imagenes de fondo no necesitan coincidir en pose de camara, encuadre ni disposicion con ningun fotograma de salida: el modelo aprende donde ubicar el primer plano en el entorno referenciado, como evoluciona el fondo con el movimiento del sujeto y de la camara implicita, y como adaptar la apariencia del primer plano para una integracion natural. La armonizacion primer plano-fondo ocurre dentro del mismo proceso generativo, sin etapa separada de relighting.

Es relevante porque elimina dos restricciones habituales de los metodos generativos previos: la exigencia de fondos prealineados y la representacion del entorno mediante un unico primer fotograma editado. Esto amplia la seleccion de fondos, la composicion de escena y el movimiento de camara en flujos de produccion reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 64) + pesos de proyeccion de entrada sobre un modelo de difusion de video transformer (Wan2.2-Fun-A14B-Control) con dos expertos, alto y bajo ruido |
| Parametros totales | No disponible (el repo ocupa 1.0 GB; los pesos del modelo base A14B no se incluyen) |
| Parametros activos | No disponible (el modelo base es A14B; el numero de parametros activos del adaptador no se especifica) |
| Longitud de contexto | No disponible (depende de la ventana de frames del modelo base) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (las indicaciones de texto opcionales dependen del codificador de texto del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`freechroma_high_noise.safetensors`, `freechroma_low_noise.safetensors`) mas `config.json` |

## Arquitectura y entrenamiento

FreeCHROMA no es un modelo completo, sino un conjunto de adaptadores que se cargan sobre Wan2.2-Fun-A14B-Control. El repositorio contiene dos ficheros safetensors, uno por experto del modelo base (alto ruido y bajo ruido), fine-tuneados por separado. Cada fichero incluye adaptadores LoRA de rango 64 aplicados a las proyecciones query, key y value de la atencion y a las capas feed-forward de todos los bloques transformer, ademas de pesos de proyeccion de entrada: la proyeccion patchify (`patch_embedding`), cuyos pesos de entrada de primer plano y mascara se entrenan, y la convolucion de referencia de fondo (`ref_conv`). El VAE, el codificador de texto y el resto de pesos transformer no se incluyen y se toman del modelo base.

El entrenamiento utiliza datos pseudo-emparejados construidos a partir de videos monoculares reales: se separan primer plano y fondo y se aumentan con modelos fundacionales existentes, usando los videos originales como objetivos de entrenamiento. El modelo aprende simultaneamente la ubicacion del primer plano en el entorno de referencia, la evolucion del fondo segun el movimiento del sujeto y de la camara, y la adaptacion de la apariencia del primer plano, integrando la armonizacion en la propia generacion sin etapa de relighting independiente. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF o DPO.

## Capacidades

- Compositing generativo de video: integra un primer plano enmascarado en un entorno definido por una a tres imagenes de fondo no alineadas.
- Preservacion de identidad, movimiento y detalles finos del primer plano durante la generacion.
- Generacion de fondo espacio-temporalmente coherente que evoluciona con el movimiento del sujeto y la camara implicita.
- Armonizacion integrada primer plano-fondo (relighting implicito) en el mismo proceso generativo.
- Manejo de referencias de fondo con pose de camara, encuadre y disposicion distintos a los fotogramas de salida.
- Soporte de indicaciones de texto opcionales para desambiguar relaciones espaciales complejas y comportamiento de camara.
- Tarea de video-to-video segun el pipeline declarado en Hugging Face.
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Postproduccion cinematografica y televisiva: sustituir el rodaje de plates de fondo coordinados por la seleccion de una a tres imagenes de referencia, reduciendo coste de preparacion y permitiendo composiciones con movimiento de camara.
- Compositing con movimiento de camara: el modelo mantiene coherencia espacio-temporal cuando la camara se mueve, escenario donde los metodos previos muestran las mayores carencias segun la model card.
- Integracion de actores en entornos virtuales: colocar una performance enmascarada en un entorno generado o fotografiado sin necesidad de alinear encuadre ni iluminacion de antemano.
- Publicidad y contenido de marca: generar variantes de un mismo plano con distintos fondos de referencia manteniendo identidad y detalle del producto o del talento.
- Prototipado rapido de escenas: explorar composiciones y comportamientos de camara con indicaciones de texto antes de comprometer un rodaje.
- Efectos visuales en pipelines automatizados: integrar el adaptador en herramientas de VFX para generar composites preliminares que sirvan de base al trabajo manual posterior.
- Restauracion o reelaboracion de material de archivo: recomponer un sujeto sobre nuevos entornos de referencia conservando su movimiento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma cualitativa que FreeCHROMA supera de forma consistente a metodos recientes de compositing y generacion de video condicionada en fidelidad de referencia, preservacion del primer plano, integracion de escena, armonizacion y calidad global del video, con mejoras especialmente claras bajo movimiento de camara, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El adaptador ocupa 1.0 GB, pero requiere cargar el modelo base Wan2.2-Fun-A14B-Control completo (VAE, codificador de texto y transformer de dos expertos), por lo que el requisito dominante es el del modelo base.
- GPU recomendadas: no disponible en la informacion proporcionada; por el tamano del modelo base (A14B) se situa en la categoria de GPU de centro de datos, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la model card remite al repositorio de codigo de GitHub para instrucciones de carga e inferencia; no se enumeran backends especificos (vLLM, llama.cpp, Ollama, TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos cuantitativos ni especificaciones de los metodos de compositing y generacion de video condicionada con los que la model card afirma comparar, por lo que no es posible construir una tabla fiable.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y cargar Wan2.2-Fun-A14B-Control, lo que implica asumir tambien la licencia y las limitaciones del modelo base.
- La model card no documenta sesgos conocidos ni tasas de alucinacion; al ser un modelo generativo de video, existe riesgo de artefactos, inconsistencias temporales o integraciones fisicamente implausibles.
- El numero maximo de imagenes de referencia es tres; no se documenta comportamiento con mas referencias.
- No se especifican idiomas soportados ni el alcance real de las indicaciones de texto.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni evidencia de uso en produccion.
- Licencia Apache 2.0 para el adaptador; deben verificarse por separado las condiciones del modelo base y de los datos de entrenamiento antes de un uso comercial.
- El paper es un preprint de arXiv (arXiv:2610.14445) y no consta revision por pares en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/JiayiWuLeo/FreeCHROMA
- Modelo base: https://huggingface.co/alibaba-pai/Wan2.2-Fun-A14B-Control
- Paper: https://arxiv.org/abs/2610.14445
- Pagina del proyecto: https://jiayi-wu-leo.github.io/freechroma/
- Codigo: https://github.com/jiayi-wu-umd/FreeCHROMA
