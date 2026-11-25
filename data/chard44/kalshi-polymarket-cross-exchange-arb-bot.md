# chard44/kalshi-polymarket-cross-exchange-arb-bot

## Resumen

`chard44/kalshi-polymarket-cross-exchange-arb-bot` no es un modelo de inteligencia artificial. Se trata de un repositorio alojado en Hugging Face cuyo contenido es un paquete ejecutable para Windows x64 (archivo `.zip` de 4,8 MB con contraseña de extracción) que se presenta como un bot de arbitraje entre las plataformas de mercados de predicción Kalshi y Polymarket. El repositorio no contiene pesos, tokenizador, configuración de arquitectura ni ningún artefacto propio de un modelo de lenguaje.

La model card describe módulos de sincronización de offsets, auto-ejecución de directorios, "instant client attach" con puente Luau VM y un "script hub" integrado, terminología que no corresponde a un modelo de IA sino a utilidades de inyección y automatización de scripts. El binario se distribuye como `dandys-world-forsaken-script-2026-v1.2.2-win64.exe` y requiere ejecutarse "como administrador", lo que junto con la contraseña fija en el archivo comprimido y la ausencia total de código fuente constituye un patrón habitual de distribución de software potencialmente no deseado.

Por tanto, esta ficha no puede documentar arquitectura, entrenamiento, capacidades ni benchmarks de un modelo, porque no existe ninguno. Los apartados siguientes reflejan esa ausencia de datos técnicos verificables y advierten de los riesgos asociados al artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio, no del modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` con un `.exe`; no hay safetensors, GGUF ni similar) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que documentar. El repositorio no incluye ficheros de pesos, configuración de transformer, tokenizador ni dataset. La model card describe componentes de software (sincronización de offsets, attach a procesos, puente Luau VM, script hub) que pertenecen al ámbito de la automatización de clientes y la inyección de scripts, no al aprendizaje automático.

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni ninguna innovación técnica de modelado. Cualquier afirmación en ese sentido sería inventada.

## Capacidades

- No se ha documentado ninguna capacidad de generación de texto, razonamiento, código, matemáticas o visión.
- No se ha documentado soporte de tool calling ni function calling.
- No se ha documentado soporte de agentes ni razonamiento multi-paso.
- No se ha documentado capacidad multilingüe real; los idiomas listados son etiquetas del repositorio, no capacidades verificadas del artefacto.
- El artefacto declarado consiste en un ejecutable de Windows que, según su propia descripción, realiza tareas de automatización e inyección de scripts, sin relación con inferencia de modelos.

## Casos de uso

No es posible proponer casos de uso legítimos de un modelo de IA porque el repositorio no contiene ninguno. Los escenarios que la model card sugiere (arbitraje entre mercados de predicción, automatización de clientes, inyección de scripts) no están respaldados por documentación técnica verificable y conllevan riesgos legales y de seguridad:

- Arbitraje entre Kalshi y Polymarket: no hay evidencia de que el binario implemente dicha lógica; ejecutar software opaco con privilegios de administrador para operar con capital real es desaconsejable.
- Automatización de clientes de terceros: la descripción menciona "instant client attach" y "Luau VM bridge", lo que sugiere manipulación de procesos ajenos, potencialmente contraria a los términos de servicio de dichas plataformas.
- Distribución de scripts: el "integrated script hub" apunta a la ejecución de código de origen desconocido, un vector clásico de malware.
- Ejecución en entornos corporativos: ejecutar un `.exe` sin firma, sin código fuente y con contraseña fija en el archivo comprimido supone un riesgo de seguridad inaceptable en producción.
- Investigación de malware: el único uso defendible sería el análisis en una máquina virtual aislada y sin credenciales, para determinar qué hace realmente el binario.
- Auditoría de cadena de suministro: revisar la discrepancia entre el nombre del repositorio (`chard44/...`), el nombre citado en la model card (`dianenelson33/...`) y la URL de descarga (`pedrolong1343/...`), indicio de suplantación o reempaquetado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Requisitos del artefacto: Windows 10 u 11 de 64 bits, privilegios de administrador para ejecutar el binario, 7-Zip o WinRAR para extraer el archivo con contraseña `2026`, y según la model card menos de 60 MB de RAM en ejecución. Latencia y throughput no disponibles.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Tampoco procede compararlo con herramientas de trading legítimas, ya que no se ha publicado código fuente ni especificación funcional que permita una comparación técnica.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no procesa lenguaje. Cualquier expectativa en ese sentido es errónea.
- Inconsistencia de identidad: el repositorio figura como `chard44/...`, la model card cita `dianenelson33/...` y el enlace de descarga apunta a `pedrolong1343/...`, patrón típico de repositorios señuelo.
- Distribución opaca: binario `.exe` sin código fuente, comprimido con contraseña fija (`2026`) y con instrucciones de ejecución como administrador, lo que dificulta el análisis y facilita la evasión de antivirus.
- Riesgo de seguridad: la combinación de ejecución con privilegios elevados, attach a procesos y ejecución de scripts de origen desconocido es compatible con malware, stealers o mineros.
- Riesgo financiero: si el usuario lo emplea para operar en mercados de predicción con capital real y el binario no hace lo que declara, las pérdidas pueden ser totales.
- Riesgo legal: la manipulación de clientes de terceros puede vulnerar términos de servicio y, según la jurisdicción, normativa sobre acceso no autorizado a sistemas.
- Licencia: se declara MIT, pero sin código fuente la licencia es inaplicable en la práctica; no hay garantías de ningún tipo.
- Idiomas: las etiquetas multilingües no implican soporte real de ningún tipo.
- Cero tracción: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento ni comunidad que valide el artefacto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chard44/kalshi-polymarket-cross-exchange-arb-bot
- Enlace de descarga citado en la model card: https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Releases citadas: https://github.com/dianenelson33/kalshi-polymarket-cross-exchange-arb-bot/releases/latest
- Paper, blog, demo o repositorio de código: no disponible
