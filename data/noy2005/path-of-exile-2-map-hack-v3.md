# noy2005/path-of-exile-2-map-hack-v3

## Resumen

La ficha solicitada corresponde al identificador `noy2005/path-of-exile-2-map-hack-v3`, publicado en Hugging Face. A pesar de estar alojado en un repositorio de modelos, el contenido no es un modelo de inteligencia artificial: es un ejecutable para Windows distribuido como archivo ZIP (`solara-executor-v3-keyless-v1.2.2-win64.zip`, 4,8 MB) que se presenta como una herramienta de trampas para el videojuego Path of Exile 2. El autor declara compatibilidad con Windows 10 y 11 de 64 bits y una licencia MIT en los metadatos.

El artefacto incluye un ejecutable (`solara-executor-v3-keyless-v1.2.2-win64.exe`, build v3.0.1) protegido con contraseña de descompresión (`2026`) y distribuido mediante enlaces a un repositorio de GitHub de terceros. La model card describe módulos de overlay externo, radar 2D, filtro de botín, perfiles JSON intercambiables y una tecla de pánico, todo orientado a interactuar con el proceso del juego en tiempo de ejecución.

Desde la perspectiva de un catálogo de modelos de IA open source, este repositorio no contiene pesos, tokenizador, configuración de arquitectura ni pipeline de inferencia. No es evaluable como modelo de lenguaje y su publicación en Hugging Face constituye un uso indebido de la plataforma. Se documenta aquí únicamente para dejar constancia técnica de su naturaleza y de los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo de IA; es un ejecutable nativo x64 para Windows |
| Parametros totales | No disponible (no existen pesos de modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Metadatos declaran en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (referido a la documentación, no a capacidades del artefacto) |
| Licencia | MIT (declarada en metadatos) |
| Formato de pesos | No aplica; se distribuye un ZIP con un binario `.exe` de 4,8 MB |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un binario compilado para Windows x64 que, segun la model card, opera en modo usuario externo, sin inyeccion de DLL en el proceso del juego, y utiliza Desktop Duplication para renderizar un overlay. La documentacion menciona sondeo a 251 Hz, seis hilos de trabajo, un consumo declarado inferior a 27 MB de RAM y una tecla de descompresion (`END`) para liberar handles.

No se proporciona informacion sobre el codigo fuente, el compilador utilizado, la cadena de suministro del binario ni auditorias de seguridad. La presencia de un ejecutable protegido con contrasena y alojado fuera de Hugging Face (en un repositorio de GitHub de un tercero distinto al autor declarado) impide verificar su contenido sin descargarlo y analizarlo en un entorno aislado.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de los modelos de IA.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues reales; los idiomas listados son metadatos de la model card.
- El artefacto, segun su propia descripcion, ofrece overlay externo, cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, radar 2D, filtro de botin por rareza y perfiles intercambiables con una tecla.
- Declara evasion de captura de pantalla en OBS, ShadowPlay y Discord.

## Casos de uso

- Ninguno legitimo en el ambito de IA open source: el repositorio no contiene un modelo desplegable en pipelines de inferencia, atencion al cliente, generacion de codigo ni analisis de datos.
- Uso como ejemplo de contaminacion de repositorios: sirve para ilustrar como se cuelan binarios ajenos al ecosistema de modelos en Hugging Face y por que conviene revisar el contenido antes de descargar.
- Analisis de malware en laboratorio aislado: un investigador de seguridad podria estudiar el binario en una maquina virtual sin acceso a red para caracterizar su comportamiento, siempre que la licencia y la legislacion lo permitan.
- Formacion en deteccion de ingenieria social: el patron de contrasena en el ZIP, insignias falsas de descargas y enlaces a terceros es un caso de estudio de tecnicas de distribucion de software no verificado.
- Auditoria de politicas de plataforma: util para equipos que definen criterios de moderacion de repositorios en hubs de modelos.
- No se recomienda su ejecucion en entornos de produccion, personales ni corporativos bajo ninguna circunstancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni metricas equivalentes.

## Requisitos de hardware

- Sistema operativo: Windows 10 o 11 de 64 bits, segun la model card.
- CPU: Intel o AMD x64; no se especifican requisitos minimos.
- RAM: la documentacion declara menos de 27 MB para el overlay, sin cifras verificables.
- GPU: no se especifica; el renderizado usa Desktop Duplication, propia de la API de Windows.
- VRAM: no aplica.
- Despliegue: no procede con vLLM, llama.cpp, Ollama ni TGI; el artefacto es un `.exe` que se ejecuta como administrador.
- Latencia y throughput: no disponibles ni verificables.

## Comparativa con modelos similares

| Criterio | `noy2005/path-of-exile-2-map-hack-v3` | Modelo de lenguaje tipico en Hugging Face | Modelo multimodal tipico en Hugging Face |
|---|---|---|---|
| Naturaleza | Binario ejecutable para Windows | Pesos de red neuronal | Pesos de red neuronal |
| Parametros | No aplica | Millones a miles de millones | Millones a miles de millones |
| Contexto | No aplica | Decenas de miles de tokens | Decenas de miles de tokens |
| Licencia | MIT declarada | Variable (Apache, MIT, custom) | Variable |
| Formatos | ZIP con `.exe` | safetensors, GGUF | safetensors, GGUF |
| Evaluable con benchmarks | No | Si | Si |
| Riesgo de seguridad | Alto (binario no verificado) | Bajo si procede de fuente fiable | Bajo si procede de fuente fiable |

No existe comparacion tecnica posible con modelos de IA porque el artefacto no pertenece a esa categoria.

## Limitaciones y advertencias

- No es un modelo de IA: cualquier expectativa de inferencia, generacion o razonamiento es infundada.
- El binario se distribuye fuera de Hugging Face, en un repositorio de GitHub de un tercero distinto al autor declarado, lo que rompe la trazabilidad de la cadena de suministro.
- El ZIP esta protegido con contrasena (`2026`), practica que dificulta el analisis automatico por parte de antivirus y plataformas de escaneo.
- La model card reconoce explicitamente que Windows Defender y SmartScreen pueden alertar por tratarse de un binario de tipo "game cheat"; esto es coherente con heurísticas de deteccion de software potencialmente no deseado.
- El uso de este tipo de herramientas en Path of Exile 2 viola previsiblemente los terminos de servicio del juego y puede conllevar el baneo de cuentas; no se ha verificado la politica concreta del editor en la informacion disponible.
- La licencia MIT declarada en los metadatos no garantiza que el binario incluya el codigo fuente correspondiente ni que el autor tenga derechos sobre todos sus componentes.
- Riesgo elevado de malware, robo de credenciales, mineros o puertas traseras: no hay auditoria publica ni firmas verificables.
- Las insignias de la model card (429K+ descargas, valoracion 4,9/5) no son verificables y contradicen el contador real de Hugging Face (0 descargas, 0 likes).
- No apto para uso comercial, produccion, entornos corporativos ni equipos personales.
- La presencia de este repositorio en Hugging Face deberia reportarse a la plataforma por uso indebido del servicio.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/noy2005/path-of-exile-2-map-hack-v3
- Repositorio de GitHub citado en la model card (tercero, no verificado): https://github.com/dominiquevasiliou7345/path-of-exile-2-map-hack-v3
- Repositorio de GitHub del supuesto paquete (tercero, no verificado): https://github.com/GraceFernandez01321/solara-executor-v3-keyless
- Enlace de descarga directa citado en la model card (no verificado, no recomendado): https://github.com/GraceFernandez01321/solara-executor-v3-keyless/releases/download/v1.2.0/solara-executor-v3-keyless-v1.2.2-win64.zip
- Pagina de releases citada: https://github.com/dominiquevasiliou7345/path-of-exile-2-map-hack-v3/releases/latest
- No se han encontrado papers, blogs tecnicos ni demos asociados en la informacion proporcionada.
