# prosperX/gmgn-bullx-photon-copytrade-bot-win11

## Resumen

El repositorio `prosperX/gmgn-bullx-photon-copytrade-bot-win11` no contiene un modelo de inteligencia artificial. Se trata de un paquete distribuido como un ejecutable portable para Windows de 64 bits (`schedule-1-cheat-trainer-v1.2.2-win64.exe`, comprimido en un ZIP de 4,8 MB protegido con contraseña) que el autor presenta como un bot de copytrading para plataformas de tokens (GMGN, BullX, Photon). No hay pesos, tokenizador, configuración de arquitectura ni ficheros de inferencia en la información disponible.

La model card está redactada como una página de descarga de software con insignias de "rating" inventadas, enlaces de descarga alojados en un repositorio de GitHub de terceros distinto del autor declarado y técnicas habituales de ingeniería social (contraseña de descompresión fija, instrucciones para ejecutar como administrador, sección de preguntas frecuentes centrada en desactivar avisos de Windows Defender y SmartScreen). Estos patrones son característicos de campañas de distribución de malware, no de artefactos de IA open source.

Por tanto, esta ficha no puede documentar arquitectura, parámetros, contexto ni capacidades de un modelo. Lo que se describe a continuación es la evaluación del artefacto desde el punto de vista de un desarrollador o investigador que se lo encuentre al buscar modelos en Hugging Face, con las advertencias de seguridad correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; aplicable a la documentación, no a un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay safetensors, GGUF ni similares) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento asociado. El artefacto es un binario Windows x64 empaquetado en `schedule-1-cheat-trainer-v1.2.2-win64.zip` (4,8 MB) con contraseña de descompresión `2026`. El tamaño de 4,8 MB es incompatible con cualquier modelo de lenguaje, incluso los más pequeños cuantizados a 4 bits, lo que confirma que no contiene pesos.

La model card describe módulos funcionales (enrutamiento de órdenes "sub-40ms", bundler de 20 wallets mediante Lookup Tables, filtro de honeypots, bóveda local AES-256, sandbox de paper trading) con métricas de rendimiento no verificables (123 Hz, 239 Hz, 96,8% de consistencia). No se aporta ningún dataset, tokenizador, receta de entrenamiento ni referencia a pesos publicados. El nombre interno del binario (`schedule-1-cheat-trainer`) no guarda relación con el título del repositorio, lo que sugiere reutilización de un paquete ajeno o renombrado deliberado.

## Capacidades

- No se puede verificar ninguna capacidad de generación de texto, razonamiento, código o matemáticas: no hay modelo.
- No hay soporte documentado de tool calling ni de function calling en el sentido de un LLM.
- No hay capacidades de agente ni de razonamiento multi-paso basadas en un modelo.
- El paquete declara funcionalidades de trading (copytrading, take profit multinivel, enrutamiento de órdenes, filtro de honeypots) que no son capacidades de IA y que no pueden auditarse sin ejecutar el binario, lo cual no se recomienda.
- La lista de idiomas de los metadatos corresponde a la documentación del paquete, no a un modelo multilingüe.

## Casos de uso

- Ninguno recomendado en el contexto de evaluación de modelos de IA: el artefacto no es un modelo y no ofrece inferencia.
- Auditoría de seguridad defensiva: un equipo de seguridad puede analizar el binario en un entorno aislado (sandbox sin red, máquina virtual desechable) para caracterizar la amenaza y actualizar reglas de detección.
- Estudio de campañas de abuso en Hugging Face: el repositorio sirve como ejemplo de model card fraudulenta con enlaces de descarga externos, contraseña fija y sección de evasión de antivirus, útil para formación de equipos de moderación.
- Documentación de indicadores de compromiso: registrar el hash del ZIP, la URL de descarga en GitHub y el nombre del ejecutable para listas de bloqueo internas.
- Concienciación de desarrolladores: usar el caso como ejemplo práctico de por qué no se deben ejecutar binarios descargados desde repositorios de modelos ni desactivar SmartScreen.
- Verificación de cadena de suministro: comprobar cómo un repositorio con licencia MIT y etiquetas de idioma puede alojar contenido que no cumple las expectativas de la plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras que aparecen en la model card (latencia de 27 ms, 123 Hz, 239 Hz, 96,8% de consistencia, "rating 99%") son afirmaciones de marketing sin metodología, sin conjuntos de datos y sin posibilidad de reproducción; no deben tratarse como benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada del ejecutable: Windows 10/11 de 64 bits, ejecución como administrador según las instrucciones del autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es compatible con estos runtimes.
- Latencia y throughput: no disponibles de forma verificable.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Frente a un modelo de lenguaje real de tamaño pequeño (por ejemplo, un modelo de 0,5 a 1,5 mil millones de parámetros en GGUF), las diferencias son categóricas: aquellos incluyen pesos, tokenizador, licencia verificable y se ejecutan en runtimes estándar; este paquete solo contiene un ejecutable opaco de 4,8 MB.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con métricas de NLP.
- Riesgo de seguridad alto: binario Windows distribuido con contraseña fija, instrucciones para ejecutarlo como administrador y una sección de preguntas frecuentes dedicada a sortear Windows Defender y SmartScreen. Estos son indicadores clásicos de malware o de software potencialmente no deseado.
- Enlace de descarga alojado en un repositorio de GitHub de un tercero (`arjunzimmermann624/schedule-1-cheat-trainer`) distinto del autor declarado en Hugging Face (`prosperX` / `FiramuXo89`), lo que rompe la trazabilidad de la cadena de suministro.
- Nombre del binario (`schedule-1-cheat-trainer`) incoherente con el título del repositorio, señal de posible reutilización de un paquete ajeno.
- Métricas de rendimiento no verificables y ausencia total de documentación técnica reproducible.
- Licencia MIT declarada, pero sin código fuente ni pesos a los que aplicarla; la licencia no aporta garantías sobre el contenido del ejecutable.
- Uso comercial desaconsejado: no hay forma de auditar qué hace el binario ni qué datos exfiltra.
- Posible suplantación de marca (GMGN, BullX, Photon) sin relación confirmada con esas plataformas.
- Si se desea inspeccionar, hacerlo únicamente en una máquina virtual sin red y sin credenciales, y nunca en un equipo de trabajo con wallets o claves.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/prosperX/gmgn-bullx-photon-copytrade-bot-win11
- Enlace de descarga citado en la model card (no recomendado): https://github.com/arjunzimmermann624/schedule-1-cheat-trainer/releases/download/v1.2.0/schedule-1-cheat-trainer-v1.2.2-win64.zip
- Releases del repositorio de GitHub citado (no recomendado): https://github.com/FiramuXo89/gmgn-bullx-photon-copytrade-bot-win11/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible.
