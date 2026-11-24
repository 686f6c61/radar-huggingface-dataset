# guxind/bybit-binance-perp-copytrade-bot-2026

## Resumen

La ficha que sigue analiza el repositorio publicado en Hugging Face con el identificador `guxind/bybit-binance-perp-copytrade-bot-2026`. Tras revisar los metadatos y la model card, hay que concluir que **no se trata de un modelo de inteligencia artificial**: no hay pesos, no hay arquitectura neuronal, no hay tokenizador ni pipeline de inferencia. Es un paquete ejecutable para Windows x64 que el autor etiqueta como bot de copytrading de perpetuos entre Bybit y Binance. La plataforma de Hugging Face lo aloja porque permite subir repositorios de cualquier tipo, pero su naturaleza es la de una aplicación de escritorio empaquetada en un ZIP, no la de un modelo fundacional.

El repositorio presenta indicios claros de una publicación de tipo señuelo o *scam*: el binario descargable se llama `monster-hunter-wilds-trainer-mod-v1.2.2-win64.exe` (nombre de un supuesto *trainer* de un videojuego, sin relación con trading), se distribuye a través de un repositorio de GitHub de terceros (`Giovanni9790/monster-hunter-wilds-trainer-mod`) y no del autor declarado, requiere una contraseña de descompresión (`2026`) y solicita ejecución como administrador. Los contadores de descargas que muestra la model card (813K+) no coinciden con los metadatos reales de Hugging Face (0 descargas, 0 *likes*), lo que refuerza la sospecha de contenido fabricado.

Por tanto, esta ficha documenta el artefacto tal como aparece publicado, señalando de forma explícita qué datos existen y cuáles no, y advirtiendo de los riesgos de seguridad asociados a su instalación. No se han encontrado parámetros, contexto, cuantizaciones ni benchmarks porque el artefacto no los tiene: no es un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64 empaquetado en ZIP) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el paquete distribuido es un ZIP con un `.exe`; no hay safetensors, GGUF ni ningún formato de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El artefacto es un binario compilado para Windows de 64 bits, distribuido como archivo ZIP de 4,8 MB con contraseña de extracción `2026`. La model card menciona módulos funcionales genéricos de un bot de trading (sandbox de *paper trading*, take profit multinivel, *bundler* de 20 carteras con *Lookup Tables*, motor de *bundles* Jito/MEV, filtro *honeypot* previo a la compra y enrutamiento de órdenes por debajo de 40 ms), pero no aporta ninguna información verificable sobre el código fuente, el lenguaje de programación, las dependencias ni los procesos internos.

Tampoco hay datos sobre conjuntos de entrenamiento, tokens procesados, RLHF, DPO ni ninguna innovación técnica de inferencia. La sección de la model card que debería contener esa información se limita a repetir el nombre del paquete y a incluir un fragmento JSON truncado. Cualquier afirmación sobre el funcionamiento interno del binario requeriría ingeniería inversa del ejecutable, algo que queda fuera del alcance de esta ficha y que, además, no se recomienda por los riesgos de seguridad descritos más abajo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta *tool calling* ni *function calling* en el sentido de los modelos de IA; la model card menciona integración con APIs de exchanges (WebSocket y gRPC), pero sin documentación técnica verificable.
- No dispone de modo *thinking*, visión, audio ni capacidades multimodales.
- La model card declara soporte para 14 idiomas en los metadatos, pero al no haber interfaz de lenguaje natural documentada, ese dato es meramente declarativo.
- Las supuestas capacidades funcionales (copytrading de perpetuos, gestión de carteras, filtros antirriesgo) no están respaldadas por código fuente, tests ni documentación técnica accesible.

## Casos de uso

- **Ninguno recomendado en producción.** El artefacto no es un modelo de IA y no se ha verificado su comportamiento; ejecutarlo como administrador en una máquina de trabajo implica riesgos de seguridad no acotados.
- **Auditoría de seguridad de artefactos sospechosos:** un analista podría usar este repositorio como caso de estudio de publicación señuelo en Hugging Face (nombre de binario incongruente, contraseña en el ZIP, enlaces a repositorios de terceros, métricas infladas).
- **Formación en detección de *scams*:** útil como ejemplo didáctico de indicadores de compromiso en cadenas de suministro de software.
- **Investigación de malware:** un equipo de respuesta a incidentes podría analizar el binario en un entorno aislado (*sandbox* sin red) para caracterizar su comportamiento, sin ejecutarlo nunca en un equipo real.
- **Monitorización de repositorios:** los equipos de moderación de plataformas pueden usar este caso para calibrar heurísticas de detección automática de contenido malicioso.
- **Documentación de riesgos en *supply chain*:** sirve para ilustrar por qué conviene exigir código fuente, *hashes* reproducibles y firmas criptográficas antes de instalar cualquier binario descargado de un repositorio público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al no tratarse de un modelo de IA, no existen métricas de MMLU, HumanEval, GSM8K ni equivalentes. Las cifras que aparecen en la model card (respuesta en menos de 12 ms, menos de 27 MB de RAM, más de 11 hilos de trabajo) son afirmaciones del autor sin metodología, sin entorno de prueba declarado y sin posibilidad de reproducción.

## Requisitos de hardware

- **Plataforma objetivo:** Windows 10 u 11 de 64 bits, según la model card.
- **VRAM:** no aplica; no hay modelo que cargar en GPU.
- **GPU recomendadas:** no aplica; el artefacto no declara uso de GPU.
- **RAM:** la model card afirma un consumo inferior a 27 MB, cifra no verificada.
- **Almacenamiento:** el ZIP ocupa 4,8 MB; el espacio en disco tras la extracción no está documentado.
- **Opciones de despliegue:** no aplica (no hay integración con vLLM, llama.cpp, Ollama, TGI ni ningún *runtime* de inferencia).
- **Latencia y throughput:** no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Si se quisiera comparar con herramientas legítimas de *trading* algorítmico, habría que acudir a proyectos de código abierto con repositorios auditables (por ejemplo, *frameworks* de *backtesting* y ejecución con licencia permisiva y comunidad activa), ninguno de los cuales se ha identificado en la información proporcionada. La comparación con modelos de lenguaje como Llama, Mistral o Qwen carece de sentido técnico.

## Limitaciones y advertencias

- **No es un modelo de IA:** no debe evaluarse como tal ni incluirse en comparativas de modelos fundacionales.
- **Indicadores de posible *malware*:** el binario descargable tiene un nombre incongruente con el propósito declarado (`monster-hunter-wilds-trainer-mod`), se aloja en un repositorio de GitHub de un tercero distinto del autor del repositorio de Hugging Face, requiere contraseña de descompresión y pide ejecución como administrador. Cualquiera de estos indicios, por separado, ya justifica precaución; en conjunto, constituyen un patrón clásico de distribución de *malware*.
- **Métricas infladas:** la model card muestra más de 813K descargas, mientras que los metadatos de Hugging Face registran 0 descargas y 0 *likes*. Esa discrepancia sugiere fabricación de credibilidad.
- **Riesgo financiero:** un bot de copytrading de perpetuos con apalancamiento puede provocar pérdidas patrimoniales significativas; la ausencia de código fuente y de auditoría impide evaluar su comportamiento real.
- **Riesgo legal y regulatorio:** la operativa con derivados sobre criptoactivos está sujeta a normativa específica en la Unión Europea (MiCA) y en España; el uso de herramientas no auditadas puede incumplir obligaciones de diligencia debida.
- **Licencia MIT declarada:** aunque permisiva, la licencia no otorga ninguna garantía sobre el binario ni sobre su inocuidad; el autor no ofrece soporte ni asume responsabilidad.
- **Sesgos y alucinación:** no aplica en el sentido habitual, pero sí existe un riesgo equivalente de información engañosa en la propia model card.
- **Recomendación:** no descargar, no extraer y no ejecutar el paquete en ningún equipo con datos sensibles o credenciales de exchange.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/guxind/bybit-binance-perp-copytrade-bot-2026
- Repositorio de GitHub referenciado en la model card (tercero, no verificado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod
- Repositorio de GitHub referenciado como alternativo en la model card: https://github.com/Berg44459/bybit-binance-perp-copytrade-bot-2026
- Enlace de descarga directa citado en la model card (no recomendado): https://github.com/Giovanni9790/monster-hunter-wilds-trainer-mod/releases/download/v1.2.0/monster-hunter-wilds-trainer-mod-v1.2.2-win64.zip
- Resultado de búsqueda web sin relación con el artefacto (descartado por no aportar información técnica): https://www.hotukdeals.com/deals/2-super-saver-seats-at-vue-cinema-for-ps8-with-octopus-energy-4862381
