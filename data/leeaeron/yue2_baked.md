# LeeAeron/YuE2_Baked

## Resumen

YuE2_Baked es un modelo de generación de música instrumental derivado de m-a-p/YuE2-3B, publicado por el usuario LeeAeron. No se trata de un entrenamiento desde cero, sino de un "baked merge": el autor ha fusionado el LoRA YuE2-instrumental-cot-full-lora dentro de la rama autorregresiva (AR) de YuE2-3B y ha exportado el resultado como GGUF cuantizado a Q8_0. El objetivo es especializar el modelo base, orientado a canciones con letra y voz, para que componga música instrumental siguiendo un plan de secciones controlable por el usuario.

La innovación principal es la combinación de un LoRA de rango 64 (aplicado a las proyecciones de atención y MLP de las 28 capas) con el modo de cadena de pensamiento de YuE2. Con `cot="full"`, el modelo escribe primero su propia partitura en notación ABC y después genera los tokens musicales condicionados por esa partitura, lo que produce canciones que terminan por sí solas con más frecuencia que la ruta sin partitura. El repositorio ocupa 0,5 GB y los safetensors declaran 132.616.130 parámetros, un dato que debe interpretarse con cautela dada la denominación "3B" del modelo base.

El interés actual del modelo es doble: por un lado, demuestra un flujo de personalización de modelos musicales mediante LoRA fusionado y cuantización GGUF; por otro, ofrece control estructural explícito (intro, verse, chorus, bridge, outro, con tiempos opcionales) sobre la generación, algo poco habitual en modelos de música abiertos. Su licencia cc-by-nc-4.0 restringe el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo (rama AR de YuE2), 28 capas, con LoRA de rango 64 fusionado en `self_attn.{q,k,v,o}_proj` y `mlp.{gate,up,down}_proj` |
| Parametros totales | 132.616.130 (segun los safetensors del repositorio); el modelo base se denomina m-a-p/YuE2-3B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | cc-by-nc-4.0 |
| Formato de pesos | GGUF (baked con LoRA); el repositorio tambien incluye safetensors |

## Arquitectura y entrenamiento

El modelo parte de m-a-p/YuE2-3B, un sistema de generación musical que separa una rama autorregresiva (AR) y etapas posteriores de decodificación de audio. Este repositorio contiene la rama AR en formato GGUF, con un LoRA fusionado que modifica todas las 28 capas del transformer: rango 64 sobre las proyecciones de query, key, value y output de la atención, y sobre las proyecciones gate, up y down del MLP.

El LoRA se entrenó con aproximadamente 2.700 pistas instrumentales emparejadas con partituras ABC anotadas con acordes procedentes de SheetSage2 (m-a-p/SheetSage2), y se regularizó al 50/50 con generaciones del propio YuE2 para evitar el olvido catastrófico. La innovación técnica destacable es el uso del chain-of-thought de YuE2: el modelo se entrenó con la partitura presente la mitad de las veces y ausente la otra mitad, de modo que `cot="full"` activa la ruta partitura-primero y `cot="off"` sigue funcionando. En las pruebas del autor, la ruta con partitura finalizó las canciones por sí sola 8 de cada 9 veces, mientras que la ruta sin partitura o bien terminaba antes de tiempo o llegaba al límite de longitud.

## Capacidades

- Generacion de musica instrumental completa, sin letra, a partir de un campo de estilo (genero, instrumentos, ambiente, BPM) y un campo de estructura.
- Modo de cadena de pensamiento (`cot="full"`): el modelo redacta primero una partitura ABC y despues sintetiza los tokens musicales condicionados por ella.
- Control estructural mediante el campo de lyrics con etiquetas desnudas: `intro`, `verse`, `pre-chorus`, `chorus`, `bridge`, `outro`, una por linea.
- Tres formas de especificar la estructura: solo `[instrumental]` (el modelo decide), etiquetas sin tiempos (el modelo decide la duracion) y etiquetas con tiempos `m:ss` (control mas fuerte del orden y las proporciones).
- Control del delta del LoRA mediante la variable `AR_SCALE` (por defecto 1.0); valores menores dan mas peso al modelo base.
- Compatibilidad con los nodos de YuE2 en ComfyUI (entrada `mode`, con paso ABC no vacio) y con el script `scripts/ar_generate.py`.
- No se le conocen capacidades de tool calling, function calling, agentes, razonamiento de texto, codigo, matematicas ni vision; es un modelo especializado en audio musical.

## Casos de uso

- Bandas sonoras instrumentales para video: dado que acepta etiquetas de seccion con tiempos, se puede alinear la musica con la estructura de un montaje (intro corta, desarrollo, outro), algo util para cortometrajes o piezas de YouTube.
- Musica de fondo para podcasts y streaming: el modo `[instrumental]` permite generar pistas largas sin letra que evitan problemas de derechos sobre canciones comerciales.
- Prototipado compositivo: usando etiquetas sin tiempos, un compositor puede pedir `[intro] [verse] [chorus] [bridge] [chorus] [outro]` y obtener maquetas para evaluar la forma antes de producir.
- Generacion de jingles y piezas de publicidad: el control de BPM y ambiente en el campo de estilo permite iterar rapidamente sobre variantes cortas de un mismo concepto sonico.
- Generacion local y offline: al distribuirse como GGUF, puede ejecutarse en entornos sin conexion o con restricciones de privacidad, sin depender de APIs de terceros.
- Investigacion en generacion musical: sirve como caso de estudio de fusion LoRA, cuantizacion GGUF y condicionamiento por partitura ABC dentro de la pipeline de YuE2.
- Creacion de bibliotecas de loops y secciones reutilizables: las etiquetas timed facilitan generar fragmentos con duraciones aproximadas conocidas para su reutilizacion en un DAW.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento aportado por el autor es cualitativo y anecdotal: la ruta partitura-primero (`cot="full"`) termino las canciones por si sola 8 de cada 9 veces, mientras que la ruta sin partitura o bien se corto antes o bien llego al limite de longitud. No es una metrica comparable con MMLU, HumanEval, GSM8K ni con benchmarks musicales estandar (FAD, CLAP, etc.), que no se han facilitado.

## Requisitos de hardware

- Tamano del repositorio: 0,5 GB, correspondiente al GGUF en Q8_0 de la rama AR.
- VRAM estimada: dado el tamano del archivo, la rama AR en Q8_0 deberia caber comodamente en menos de 2 GB de VRAM; sin embargo, la pipeline completa de YuE2 (decodificacion de audio) puede requerir memoria adicional no especificada. Dato exacto: no disponible.
- GPU recomendadas: cualquier GPU consumer con al menos unos pocos GB de VRAM deberia poder cargar la rama AR; no se dispone de requisitos oficiales para la pipeline completa.
- Cabe en GPU consumer: si, previsiblemente, dado el tamano del archivo GGUF, aunque la memoria total depende de los componentes adicionales de YuE2.
- Opciones de despliegue: runtime compatible con GGUF, nodos de YuE2 en ComfyUI y el script `scripts/ar_generate.py`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye especificaciones de alternativas, por lo que la comparacion se limita al modelo base y a la categoria general.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeeAeron/YuE2_Baked | 132.616.130 (safetensors); base 3B | no disponible | sin benchmarks publicos | cc-by-nc-4.0 | HuggingFace (0 descargas, 0 likes) |
| m-a-p/YuE2-3B (base) | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| MusicGen (Meta), Stable Audio Open y otros generadores musicales abiertos | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de los modelos alternativos no estan disponibles en la informacion proporcionada; se citan unicamente como referencias de categoria y no se comparan cifras concretas para no introducir datos no verificados.

## Limitaciones y advertencias

- Licencia cc-by-nc-4.0: prohibido el uso comercial. Cualquier producto, servicio o integracion remunerada requiere una licencia distinta que no se menciona.
- Riesgo de artefactos musicales y de alucinacion estructural: el autor indica que los tiempos por seccion son una guia, no una garantia. El modelo sigue mejor el orden y las proporciones que el tiempo de fin absoluto, y tiende a canciones de 3 a 5 minutos independientemente del plan.
- Restricciones del campo de lyrics: solo deben usarse las etiquetas `intro`, `verse`, `pre-chorus`, `chorus`, `bridge` y `outro`. Introducir notas de produccion, texto de letras o caracteres `\n` literales aleja la salida del comportamiento entrenado.
- Discrepancia de parametros: los safetensors declaran 132.616.130 parametros mientras el modelo base se denomina "YuE2-3B"; conviene verificar el alcance real del artefacto antes de integrarlo.
- Idiomas soportados: no disponible. Al ser un modelo instrumental, la cuestion de idioma aplica a posibles metadatos o interfaces, no a la salida musical.
- Longitud de contexto: no disponible, lo que dificulta planificar composiciones muy largas o condicionamientos extensos.
- Madurez: el repositorio no tiene descargas ni likes y no se han publicado benchmarks independientes, por lo que la validacion comunitaria es nula.
- Cautela en produccion: cualquier despliegue deberia validar la calidad de audio, la coherencia estructural y los derechos de uso de la licencia antes de integrar el modelo en un flujo comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LeeAeron/YuE2_Baked
- Modelo base: https://huggingface.co/m-a-p/YuE2-3B
- Dataset de partituras ABC: https://huggingface.co/m-a-p/SheetSage2
- Nota sobre la busqueda web: los resultados obtenidos no contienen informacion relevante sobre el modelo (tratan sobre becas de formacion en Slovenia) y no se han utilizado como fuente.
