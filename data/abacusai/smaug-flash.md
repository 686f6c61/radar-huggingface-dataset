# abacusai/Smaug-Flash

## Resumen

Smaug-Flash es un ajuste fino orientado a codigo agentico sobre DeepSeek-V4-Flash-0731, desarrollado por Abacus.AI. El modelo conserva exactamente la misma arquitectura, formato de pesos, longitud de contexto e interfaz de razonamiento que la version oficial, de modo que se sirve con la misma pila de inferencia sin modificaciones. Con 304.180.418.494 parametros totales y 43 capas, es un transformer de tipo Mixture-of-Experts (MoE) con atencion MLA y contexto de 1.048.576 tokens.

El objetivo declarado es mejorar el rendimiento de extremo a extremo en bucles agenticos largos, reduciendo bloqueos y giros innecesarios en modo de razonamiento maximo. Segun la model card, la mejora es de +14,3 puntos en LiveBench agentic-coding, +10,1 en Terminal Bench 2.1 bajo el arnes de DeepSeek, +13,7 en AutomationBench y +19 en NL2Repo-Bench, manteniendo una mejora general de +3,2 en LiveBench.

La adaptacion se hizo con tres adaptadores LoRA entrenados en secuencia (dos pasos de SFT y uno de KTO) fusionados como deltas completos, y afecta unicamente a las matrices de factores de atencion MLA (129 en total). Expertos, router, embeddings y el modulo de decodificacion especulativa permanecen identicos al lanzamiento oficial, incluido el empaquetado FP4. Se publica bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con atencion MLA (factores q/o de bajo rango) e indexador disperso de tokens |
| Parametros totales | 304.180.418.494 (dato de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | Block-FP8 en atencion (e4m3, bloques 128x128) y expertos empaquetados en FP4; el repositorio incluye tambien variante de 8 bits |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (formato nativo del checkpoint: block-FP8 y packed-FP4) |
| Numero de capas | 43 |
| Dimension oculta de atencion | 4096 |
| Cabezas de atencion | 64 |
| Expertos enrutados | 256 |
| Expertos seleccionados por token | 6 |
| Expertos compartidos | 1 |
| Dimension oculta MoE por experto | 2048 |
| Tamano de vocabulario | ~129.000 |
| Decodificacion especulativa | Modulo multi-token DSpark (heredado del modelo base) |
| Modalidad | Texto |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash-0731 |
| Tipo de adaptacion | SFT + adaptadores LoRA de preferencia, fusionados como deltas completos (solo atencion) |
| Tamano del repositorio | 166,9 GB |
| Libreria | transformers |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 43 capas con atencion MLA de factores q/o de bajo rango y un indexador disperso de tokens, 256 expertos enrutados de los que se activan 6 por token, mas un experto compartido. Cada experto tiene una dimension oculta de 2048 y la dimension oculta de atencion es 4096 con 64 cabezas. El vocabulario ronda los 129.000 tokens. El modelo hereda el modulo de decodificacion especulativa multi-token DSpark del lanzamiento oficial.

El entrenamiento consistio en la composicion de tres adaptadores LoRA entrenados de forma secuencial: dos pasos de SFT y un paso de KTO, fusionados como deltas completos sin truncado de rango. Solo se adaptaron las 129 matrices de factores de atencion MLA; los expertos, el router, los embeddings y el modulo especulativo quedaron byte a byte identicos al modelo base, incluido el empaquetado FP4. Las matrices modificadas se recuantizaron al formato block-FP8 nativo del checkpoint. Los datos de entrenamiento no se divulgan: consisten en trazas de bucles agenticos curadas de repositorios publicos, trazas sintetizadas a partir de casos de uso reales de productos agenticos y variaciones sinteticas adicionales.

## Capacidades

- Generacion de texto y razonamiento general en modo texto.
- Codigo y desarrollo de software, con foco especifico en flujos de trabajo agenticos de principio a fin.
- Uso de herramientas (tool calling / function calling) en bucles multi-paso.
- Comportamiento agentico en terminal: el modelo esta optimizado para tareas tipo Terminal Bench bajo el arnes de DeepSeek.
- Automatizacion de flujos (AutomationBench) y generacion de repositorios a partir de lenguaje natural (NL2Repo-Bench).
- Razonamiento de multiples pasos con contexto largo, hasta 1.048.576 tokens.
- Modo de razonamiento maximo, con finalizacion mas rapida de tareas que el modelo base (menos turnos y envios mas tempranos).
- Decodificacion especulativa activa (modulo DSpark) para acelerar la generacion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Agentes de codificacion autonoma en repositorios grandes: el modelo puede recorrer un arbol de ficheros, leer y editar codigo y ejecutar comandos en bucle, apoyandose en el contexto de 1M tokens para mantener visibles ficheros y trazas de herramientas sin recortes agresivos.
- Automatizacion de terminal y operaciones (AIOps): con la mejora reportada de +10,1 en Terminal Bench 2.1, es adecuado para agentes que ejecutan comandos, diagnostican fallos y aplican correcciones sobre sistemas reales.
- Integracion en pipelines de CI/CD: soporta tool calling y bucles multi-paso, de modo que puede encargarse de tareas como triaje de fallos de build, generacion de parches y actualizacion de dependencias con verificacion posterior.
- Migracion y generacion de repositorios completos: la mejora de +19 puntos en NL2Repo-Bench lo hace util para scaffoldeado de proyectos, generacion de estructura de carpetas, ficheros de configuracion y pruebas iniciales a partir de una especificacion en lenguaje natural.
- Automatizacion de procesos de negocio: con +13,7 en AutomationBench, encaja en tareas de extraccion, transformacion y verificacion de datos entre sistemas, encadenando llamadas a APIs y comprobaciones intermedias.
- Agentes personales conectados a mensajeria: segun el anuncio de Abacus.AI, Smaug-Flash esta optimizado para agentes personales que se conectan a aplicaciones de mensajeria como WhatsApp, Telegram y Slack.
- Asistentes de revision de codigo en produccion: puede analizar diffs largos dentro de su ventana de contexto y emitir comentarios estructurados mediante salidas con formato, integrándose en el flujo de revision de pull requests.
- Investigacion sobre ajuste fino eficiente: al adaptar solo 129 matrices de atencion y dejar el resto intacto, sirve como caso de estudio para estudiar cuanto rendimiento agentico se puede obtener modificando exclusivamente la atencion.

## Benchmarks y rendimiento

Los resultados publicados se expresan como diferencias frente al modelo base, no como valores absolutos. Las evaluaciones se realizaron sobre generaciones de tareas nuevas de 2026, con auto-servicio, usando los arneses publicos de cada benchmark y ejecutando el modelo base bajo arneses identicos en cada comparacion pareada.

| Benchmark | Diferencia frente a DeepSeek-V4-Flash-0731 |
|---|---|
| LiveBench agentic-coding | +14,3 |
| Terminal Bench 2.1 (arnes de DeepSeek) | +10,1 |
| AutomationBench | +13,7 |
| NL2Repo-Bench | +19,0 |
| LiveBench (global) | +3,2 |

Notas sobre la medicion, segun la model card: las filas sin asterisco corresponden a ejecuciones pareadas bajo el mismo arnes; en las filas marcadas con asterisco la puntuacion del modelo base es la cifra reportada por el proveedor para el mismo conjunto publico de tareas. El perfil por categorias de LiveBench se presenta como grafico (puntuaciones 0-100, media de las siete categorias) sobre la release LiveBench 2026-06-25, pero los valores numericos absolutos no se incluyen en el texto disponible.

## Requisitos de hardware

- VRAM estimada para pesos: el repositorio ocupa 166,9 GB, por lo que se necesitan aproximadamente 167-180 GB de memoria solo para cargar los pesos en el formato nativo (atencion block-FP8 y expertos packed-FP4), mas el espacio de trabajo y la cache KV.
- Cache KV para 1M de tokens: no disponible. La atencion MLA comprime la cache respecto a atencion completa, pero no se han publicado cifras de memoria por token.
- GPU recomendadas: no disponibles de forma explicita. Por tamano y por el uso de kernels FP4, el despliegue realista requiere GPUs de centro de datos de gama alta (clase H100/H200 o B200) y configuracion multi-GPU.
- GPU de consumo: no cabe en GPUs de consumo. Un modelo de 304.000 millones de parametros con pesos de ~167 GB excede la VRAM de cualquier tarjeta consumer actual; solo seria viable con offloading agresivo a memoria del sistema y una caida severa de throughput.
- Opciones de despliegue: cualquier pila de servicio que ejecute el lanzamiento oficial de DeepSeek-V4-Flash-0731 ejecuta Smaug-Flash sin modificaciones, incluidos los kernels de expertos FP4 y las rutas de decodificacion especulativa. La model card advierte de servir en el formato nativo del checkpoint: recuantizar los pesos fusionados a otro esquema en tiempo de carga degrada de forma medible el seguimiento de instrucciones restringidas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Relacion | Rendimiento relativo |
|---|---|---|---|---|---|
| abacusai/Smaug-Flash | 304.180.418.494 | 1.048.576 | MIT | Ajuste fino de atencion sobre DeepSeek-V4-Flash-0731 | +14,3 LiveBench agentic-coding, +10,1 Terminal Bench 2.1, +13,7 AutomationBench, +19 NL2Repo-Bench, +3,2 LiveBench global frente a su base |
| deepseek-ai/DeepSeek-V4-Flash-0731 | no disponible | 1.048.576 | no disponible | Modelo base | Referencia de todas las comparaciones pareadas |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

Solo se dispone de datos comparativos frente al modelo base. No se han proporcionado resultados que permitan situar el modelo frente a otras familias de tamano o tarea similar.

## Limitaciones y advertencias

- La model card indica que Smaug-Flash es mas decidido que su base: termina las tareas en menos turnos y mas densos, y entrega antes. En escenarios con restricciones estrictas de tiempo de reloj, ese comportamiento puede traducirse en menos exploracion de alternativas antes de responder.
- Se advierte explicitamente de que servir el modelo recuantizado a un esquema distinto del nativo en tiempo de carga degrada el seguimiento de instrucciones restringidas.
- Los datos de entrenamiento no se divulgan; no es posible auditar la composicion del corpus ni evaluar sesgos derivados de las trazas de repositorios publicos utilizadas.
- Idiomas soportados: no disponible. No hay informacion sobre cobertura multilingue ni sobre el rendimiento fuera del ingles.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada. Como modelo generativo de texto sin componente de recuperacion propio, sigue siendo aplicable la advertencia habitual de verificar codigo, comandos y hechos antes de ejecutarlos o publicarlos.
- Coste de despliegue elevado: ~167 GB de pesos en formato nativo implican infraestructura multi-GPU de centro de datos, lo que limita el uso en entornos con presupuesto reducido.
- Los resultados publicados son diferencias frente al modelo base, no puntuaciones absolutas; no permiten comparar directamente con modelos evaluados bajo otros arneses.
- Parte de las puntuaciones del modelo base en las comparaciones se tomaron de cifras reportadas por el proveedor y no de ejecuciones propias, lo que introduce una fuente potencial de inconsistencia.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de copyright y la licencia. Conviene verificar si el modelo base impone condiciones adicionales que puedan afectar a la redistribucion.
- Advertencia de verificacion: parte de la informacion publicada (fechas y versiones del modelo base) no ha podido contrastarse con fuentes independientes en la busqueda realizada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/abacusai/Smaug-Flash
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Organizacion en HuggingFace: https://huggingface.co/abacusai
- Sitio de Abacus.AI: https://abacus.ai
- Anuncio de la linea Smaug de modelos de pesos abiertos: https://finance.yahoo.com/technology/ai/articles/abacus-ai-launches-smaug-line-160000796.html
- Figura de comparacion frente al modelo base: figures/smaug_flash_vs_base_bars.png (referenciada en el repositorio del modelo)
- Figura de perfil por categorias de LiveBench: figures/smaug_flash_livebench_categories.png (referenciada en el repositorio del modelo)
