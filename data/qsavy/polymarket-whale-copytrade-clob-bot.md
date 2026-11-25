# Qsavy/polymarket-whale-copytrade-clob-bot

## Resumen

`Qsavy/polymarket-whale-copytrade-clob-bot` es un repositorio alojado en Hugging Face que **no contiene un modelo de inteligencia artificial**. Se trata de un paquete ejecutable para Windows (x64) presentado como bot de copia de operaciones (*copytrade*) sobre Polymarket, con supuestas funciones de filtrado de honeypots, motor de bundles Jito/MEV, espejo de carteras de ballenas y enrutado de órdenes de baja latencia. El artefacto distribuido es un archivo ZIP de 4,8 MB con contraseña, que contiene un binario `.exe` que se solicita ejecutar como administrador.

Desde la perspectiva de un catálogo de modelos, la ficha no puede completarse con parámetros, arquitectura ni datos de entrenamiento porque no existen: el repositorio no publica pesos, tokenizador, configuración de transformer ni pipeline de inferencia. La etiqueta `pipeline` aparece como no disponible y las descargas registradas son 0, lo que refuerza que no hay un artefacto de modelo consumible.

La relevancia de esta entrada es, por tanto, negativa y de advertencia: el patrón de distribución (ZIP con contraseña, binario renombrado con un nombre ajeno —un supuesto *trainer* de un videojuego—, instrucciones para ejecutar como administrador y desactivar avisos de SmartScreen, enlaces a repositorios de GitHub de terceros) coincide con el de campañas de malware distribuidas a través de repositorios de modelos. No debe tratarse como un modelo evaluable ni ejecutarse en un entorno de producción o de investigación sin análisis previo en una máquina aislada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un paquete ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como etiquetas de la model card, no como capacidades del modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP de 4,8 MB con un `.exe`; no hay safetensors, GGUF ni binarios de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal que describir. La model card no documenta transformer, MoE, SSM ni ningún otro paradigma, y tampoco aporta información sobre datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO o ajuste fino. Los únicos elementos técnicos mencionados son características de un supuesto motor de trading: sondeo a 471 Hz y 318 Hz, 15 hilos de trabajo, enrutado de órdenes por debajo de 40 ms, consumo declarado inferior a 63 MB y 56 MB de RAM en determinados módulos, y verificación de autoridades de mint/freeze y bloqueo de liquidez.

Cabe señalar que varias de esas afirmaciones son incoherentes con el contexto declarado: las referencias a Jito, bundles atómicos y autoridades de mint/freeze corresponden al ecosistema Solana, mientras que Polymarket opera sobre Polygon y un libro de órdenes CLOB. Esa mezcla de terminología de cadenas distintas es un indicio adicional de que el texto de la model card es material promocional generado, no documentación técnica verificable.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de *tool calling* ni de *function calling* en el sentido de un modelo de lenguaje.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- El multilingüismo aparece únicamente como lista de etiquetas de idioma en los metadatos, sin evidencia de evaluación.
- Las supuestas capacidades funcionales son de trading: filtro anti-honeypot previo a la compra, espejo de carteras de ballenas con dimensionamiento proporcional, *take profit* multinivel con *trailing stop*, sandbox de *paper trading* y enrutado de órdenes por WebSocket y gRPC.
- Ninguna de esas capacidades está respaldada por código fuente publicado, tests, auditoría o resultados reproducibles en el repositorio.

## Casos de uso

- Auditoría de seguridad de la cadena de suministro: el repositorio sirve como muestra representativa de un patrón de publicación abusivo en Hugging Face, útil para entrenar clasificadores o reglas de detección en plataformas de *model scanning*.
- Análisis forense en entorno aislado: un equipo de respuesta a incidentes puede diseccionar el ZIP y el binario en una máquina virtual sin red para documentar Indicadores de Compromiso (IoC) y firmas.
- Formación en concienciación: el caso ilustra ante desarrolladores por qué no deben ejecutarse binarios de repositorios de modelos como administrador ni desactivar SmartScreen.
- Estudio de ingeniería social: la sustitución del nombre del ejecutable por el de un *trainer* de videojuego es un ejemplo concreto de camuflaje de payload para evadir filtros basados en nombre.
- Evaluación de políticas de moderación: permite contrastar cómo distintas plataformas tratan repositorios con contenido no relacionado con modelos y con instrucciones de ejecución de binarios.
- Verificación de pipelines de catalogación: sirve como caso negativo para probar que un sistema de fichas detecta la ausencia de pesos y de pipeline y no inventa especificaciones.

En ningún caso se recomienda su uso para copia de operaciones, trading automatizado ni despliegue en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay MMLU, HumanEval, GSM8K ni métricas de inferencia. Las cifras que aparecen en la model card (frecuencias de sondeo, latencia, consumo de RAM) son afirmaciones de marketing sin metodología, sin hardware de referencia y sin posibilidad de reproducción.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados por el autor: Windows 10 u 11 de 64 bits, extracción del ZIP de 4,8 MB y ejecución del `.exe` como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.
- Recomendación operativa: si se manipula el artefacto, hacerlo en máquina virtual sin red, sin credenciales y con instantánea previa.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo. Frente a un modelo de lenguaje real de tamaño pequeño o mediano, las diferencias son categóricas: aquí no hay parámetros, contexto, licencia de pesos, formato de publicación ni evaluación.

| Criterio | Este repositorio | Modelo de IA típico en Hugging Face |
|---|---|---|
| Pesos publicados | No | Sí (safetensors, GGUF) |
| Configuración y tokenizador | No | Sí |
| Pipeline declarado | No disponible | Definido (text-generation, etc.) |
| Evaluaciones reproducibles | No | Habitualmente sí |
| Artefacto principal | ZIP con `.exe` de 4,8 MB | Pesos y código de inferencia |
| Riesgo para el usuario | Alto (ejecución de binario como administrador) | Bajo o medio según procedencia |

## Limitaciones y advertencias

- No es un modelo de IA: no puede evaluarse con las métricas habituales ni integrarse en pipelines de inferencia.
- El binario se distribuye comprimido con contraseña, lo que impide el análisis estático por parte de escáneres automáticos antes de la extracción.
- El ejecutable lleva un nombre ajeno al proyecto (un supuesto *trainer* de videojuego), práctica habitual para dificultar la detección por reglas basadas en cadenas.
- Las instrucciones piden ejecutar como administrador y justifican los avisos de Windows Defender y SmartScreen como falsos positivos, lo que elimina las protecciones del sistema operativo.
- Los enlaces de descarga apuntan a repositorios de GitHub de terceros distintos del autor declarado, lo que rompe la cadena de custodia del artefacto.
- El texto mezcla terminología de Solana (Jito, bundles, mint/freeze authority) con un supuesto bot para Polymarket, que opera sobre Polygon; la incoherencia sugiere contenido generado automáticamente.
- Cero descargas y cero *likes* en el momento de la consulta: no hay señal de uso legítimo ni comunidad que lo respalde.
- La licencia MIT declarada en los metadatos no otorga ninguna garantía sobre el binario ni sobre su comportamiento en ejecución.
- Riesgo de robo de credenciales, claves de API de exchanges o fondos si se ejecuta en una máquina con acceso a carteras.
- No debe citarse como referencia técnica de trading algorítmico: no hay código, *backtests* ni auditoría publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Qsavy/polymarket-whale-copytrade-clob-bot
- Repositorio de GitHub citado en la model card (descarga del ZIP): https://github.com/ErikMercier70637/kingdom-come-deliverance-2-trainer-2026/releases/download/v1.2.0/kingdom-come-deliverance-2-trainer-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado para contraseña y releases: https://github.com/kohakumishra/polymarket-whale-copytrade-clob-bot/releases/latest
- Paper, blog, demo o documentación técnica: no disponible
