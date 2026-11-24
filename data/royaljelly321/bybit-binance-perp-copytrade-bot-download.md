# Royaljelly321/bybit-binance-perp-copytrade-bot-download

## Resumen

La ficha corresponde a `Royaljelly321/bybit-binance-perp-copytrade-bot-download`, un repositorio alojado en Hugging Face que no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 distribuido como archivo ZIP. El contenido de la model card describe un supuesto bot de copy trading de perpetuos para Bybit y Binance, empaquetado en `fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip` (4,8 MB) y protegido con la contraseña `2026`. No existe arquitectura neuronal, pesos, tokenizador ni pipeline de inferencia asociado.

El repositorio carece de cualquier elemento propio de un modelo de lenguaje: no hay parámetros, no hay longitud de contexto, no hay tipos de cuantización y no se declara pipeline en los metadatos de Hugging Face. Las etiquetas (`windows`, `windows-11`, `x64`, `portable`) confirman que se trata de un binario para sistema operativo, no de un artefacto de IA. La licencia declarada es MIT, aunque su aplicabilidad a un ejecutable de terceros sin código fuente verificable es cuestionable.

La relevancia de esta ficha es fundamentalmente negativa: sirve como ejemplo de contenido que no debe evaluarse como modelo y que presenta múltiples señales de riesgo (ejecutable sin trazabilidad, contraseña de extracción, enlaces de descarga alojados en repositorios de GitHub de terceros no vinculados al autor declarado, y una model card con referencias cruzadas a un proyecto ajeno de macro para un videojuego). No se recomienda su descarga ni ejecución en entornos de producción o de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (declarados como metadatos del repositorio, sin relación con capacidades lingüísticas de un modelo) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors ni GGUF) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de inferencia que describir. El contenido del repositorio es un archivo comprimido de 4,8 MB con un ejecutable denominado `fisch-script-auto-catch-macro-2026-v1.2.2-win64.exe`, etiquetado internamente como build `v3.2.5 (EEB054)`. La model card menciona componentes funcionales del supuesto bot (filtro honeypot, motor de bundles Jito/MEV, sandbox de paper trading, almacén de claves AES-256, take profit escalonado y enrutamiento de órdenes por WebSocket/gRPC), pero ninguno de ellos es verificable a partir de los artefactos publicados.

La denominación del binario remite a un macro de auto-captura para el juego *Fisch*, no a un bot de trading, lo que sugiere una plantilla de model card reutilizada o un empaquetado engañoso. Los enlaces de descarga apuntan a repositorios de GitHub (`YokoCastro3813/fisch-script-auto-catch-macro-2026` y `HannahTakeda47/bybit-binance-perp-copytrade-bot-download`) que no coinciden con el autor del repositorio en Hugging Face (`Royaljelly321`).

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No hay soporte verificable de tool calling ni de function calling.
- No hay soporte de agentes ni de razonamiento multi-paso.
- Las capacidades multilingües declaradas en los metadatos no están respaldadas por ningún modelo subyacente.
- El único contenido funcional descrito es un ejecutable de escritorio para Windows con supuestas funciones de trading automatizado, sin código fuente ni verificación independiente.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA, ya que no lo es.
- Auditoría de seguridad: el artefacto puede emplearse como caso de estudio en formación sobre riesgos de cadena de suministro en repositorios de modelos, analizando las discrepancias entre autor declarado, enlaces de descarga y contenido del binario.
- Análisis de detección de malware: investigadores pueden examinar el ejecutable en un entorno aislado para documentar técnicas de empaquetado y evasión, sin ejecutarlo en sistemas de producción.
- Estudio de moderación de plataformas: sirve para ilustrar patrones de model cards fraudulentas (contraseñas de extracción, insignias de descargas infladas, referencias cruzadas a proyectos ajenos) y diseñar filtros automáticos.
- Formación en higiene de repositorios: ejemplo práctico de por qué no deben ejecutarse binarios descargados de Hugging Face sin verificación de firma ni revisión de código.
- Documentación de taxonomías: útil para clasificar artefactos no-modelo dentro de catálogos de Hugging Face y evitar que contaminen índices de modelos evaluables.

En ningún caso se recomienda su uso para copy trading real, gestión de claves, conexión a exchanges ni despliegue en infraestructura con credenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, y las cifras de rendimiento que aparecen en la model card (respuesta en menos de 31 ms, consistencia del 99,4 %, uso de RAM inferior a 44 MB, enrutamiento por debajo de 40 ms) son afirmaciones del autor sin metodología, sin código y sin verificación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma objetivo declarada: Windows 10 y Windows 11 de 64 bits.
- Opciones de despliegue: no aplica (no hay integración con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles de forma verificable; las cifras de la model card no son reproducibles.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a otros repositorios de Hugging Face, la comparación relevante sería con otros paquetes de software alojados en la plataforma, pero no se dispone de datos verificables para establecer una tabla de comparación técnica.

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura, tokenizador y pipeline; evaluarlo como modelo lleva a conclusiones erróneas.
- Ejecutable sin código fuente: el ZIP contiene un `.exe` que se solicita ejecutar como administrador, lo que otorga privilegios elevados a un binario no auditado.
- Contraseña de extracción (`2026`) y enlaces de descarga alojados en repositorios de GitHub de terceros no vinculados al autor del repositorio en Hugging Face.
- Discrepancia entre el nombre del binario (macro para el juego *Fisch*) y el propósito declarado (bot de copy trading), indicio de plantilla reutilizada o empaquetado engañoso.
- Riesgo de robo de credenciales: la model card menciona un almacén de claves AES-256 y conexión a exchanges; un binario no verificado podría exfiltrar claves de API.
- Riesgo financiero: cualquier uso para operar en mercados de perpetuos con apalancamiento puede derivar en pérdidas patrimoniales.
- Insignias de descargas (408K+) y tamaño (4,8 MB) no verificables; los metadatos de Hugging Face registran 0 descargas y 0 likes.
- Licencia MIT declarada, pero sin código fuente disponible para verificar su cumplimiento ni la procedencia del binario.
- Sesgos y alucinación: no aplica como modelo de lenguaje, pero la documentación contiene afirmaciones no contrastadas que funcionan como desinformación.
- Recomendación: no descargar, no extraer y no ejecutar en sistemas con credenciales, carteras cripto o acceso a exchanges.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Royaljelly321/bybit-binance-perp-copytrade-bot-download
- Enlace de descarga citado en la model card (GitHub, tercero): https://github.com/YokoCastro3813/fisch-script-auto-catch-macro-2026/releases/download/v1.2.0/fisch-script-auto-catch-macro-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (tercero): https://github.com/HannahTakeda47/bybit-binance-perp-copytrade-bot-download/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
