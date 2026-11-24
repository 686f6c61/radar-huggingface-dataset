# Ryuk2kc/liars-bar-cheat-esp-keyless

## Resumen

El artefacto publicado bajo el identificador `Ryuk2kc/liars-bar-cheat-esp-keyless` no es un modelo de inteligencia artificial ni un modelo de lenguaje. Se trata de un binario ejecutable para Windows distribuido a través de Hugging Face, etiquetado por su autor como una herramienta de tipo "cheat ESP" (extra-sensorial perception, es decir, superposición de información visual) destinada al videojuego *Liar's Bar*. El paquete se presenta como un archivo ZIP de 8,9 MB con un ejecutable `liars-bar-cheat-esp-keyless-v1.2.0-win64.exe` y una contraseña de extracción fija.

La publicación no incluye arquitectura de red neuronal, pesos, tokenizador, configuración de contexto ni ningún artefacto propio de un modelo de aprendizaje automático. Los metadatos de Hugging Face (pipeline no disponible, cero descargas, cero likes, licencia MIT) y la model card confirman que se trata de una distribución de software de terceros alojada en la plataforma, no de un modelo entrenado.

Desde la perspectiva de un catálogo técnico de IA open source, esta ficha se emite para dejar constancia de que el artefacto no cumple los criterios de inclusión como modelo y para advertir de los riesgos asociados a su descarga y ejecución. Todos los campos propios de especificaciones de modelo se marcan como no disponibles porque no existen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de metadatos, no capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en metadatos y model card) |
| Formato de pesos | no disponible (el paquete distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo ni proceso de entrenamiento. El contenido descrito en la model card corresponde a un ejecutable de Windows de 8,9 MB comprimido, con un binario interno de nombre `liars-bar-cheat-esp-keyless-v1.2.0-win64.exe` y una compilación identificada como `v4.0.8 (0D9F84)`. La documentación del autor menciona módulos de superposición gráfica (cajas 2D/3D, esqueletos de huesos, radar 2D, filtrado de objetos por rareza), suavizado de entrada tipo Bézier, un escáner de offsets dinámicos y una tecla de pánico (`END`) para descargar el proceso.

No se aporta información sobre dataset, tokens de entrenamiento, RLHF, DPO ni ninguna técnica de aprendizaje automático. Tampoco se documenta el binario en términos de dependencias, cadena de compilación o análisis de seguridad. La única información verificable es la estructura de la model card y los metadatos de la plataforma.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No dispone de tool calling ni function calling en el sentido de un modelo de IA.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües reales; las etiquetas de idioma son metadatos de la publicación.
- El binario declara funcionalidades de superposición visual sobre el juego *Liar's Bar*: cajas delimitadoras 2D/3D, esqueletos, radar 2D, filtrado de objetos y suavizado de entrada.
- Incluye una tecla de descarga rápida (`END`) según la documentación del autor.

## Casos de uso

Ninguno de los siguientes casos constituye un uso legítimo o recomendado del artefacto; se listan únicamente para caracterizar su naturaleza declarada y los riesgos asociados.

- Superposición visual en *Liar's Bar*: el autor describe cajas y esqueletos sobre otros jugadores; su uso en partidas multijugador puede vulnerar los términos de servicio del juego y derivar en expulsión o suspensión de cuenta.
- Exclusión de captura en streaming: la model card menciona compatibilidad con OBS, ShadowPlay y Discord; esta funcionalidad está orientada a ocultar la superposición en retransmisiones, lo que agrava el riesgo de fraude.
- Distribución de binarios con contraseña fija: el patrón de ZIP protegido con contraseña (`2026`) y ejecutable "como administrador" es habitual en campañas de distribución de software no verificado.
- Análisis de malware en laboratorio aislado: un investigador de seguridad podría extraer y analizar el binario en una máquina virtual sin red para estudiar su comportamiento, sin ejecutarlo en un equipo de producción.
- Docencia sobre riesgos de plataformas de modelos: el caso sirve para ilustrar que Hugging Face aloja artefactos que no son modelos y que requieren controles de admisión.
- Auditoría de licencias y cumplimiento: el uso de la etiqueta MIT en un binario de terceros sin código fuente asociado plantea dudas sobre la validez de la licencia declarada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El artefacto no es un modelo evaluable con MMLU, HumanEval, GSM8K ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada: no aplica; no hay inferencia de modelo.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows 10/11 de 64 bits, procesadores Intel y AMD x64.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama, TGI no son relevantes).
- Latencia y throughput: no disponibles; la model card menciona una superposición "144 Hz+" y un consumo de RAM inferior a 24 MB y 56 MB en módulos concretos, sin metodología de medición.
- Espacio en disco del paquete: 8,9 MB comprimido.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. Como referencia de categoría, se compara con otros tipos de artefacto alojados en la misma plataforma:

| Criterio | Este artefacto | Modelo de lenguaje open source típico | Binario de utilidad legítima |
|---|---|---|---|
| Naturaleza | Ejecutable Windows x64 | Pesos + configuración | Ejecutable firmado |
| Pesos | No | Safetensors/GGUF | No aplica |
| Contexto | No aplica | Miles a millones de tokens | No aplica |
| Evaluación | Ninguna | Benchmarks públicos | Auditoría de código |
| Licencia | MIT declarada | MIT, Apache 2.0, etc. | Comercial o libre |
| Verificabilidad | Baja (ZIP con contraseña) | Alta (pesos y card) | Media-alta (firma) |

## Limitaciones y advertencias

- No es un modelo de IA: no debe catalogarse, evaluarse ni desplegarse como tal.
- Riesgo de seguridad elevado: ejecutable de origen no verificado, distribuido como ZIP con contraseña fija y con instrucciones para ejecutarlo como administrador; patrón compatible con malware.
- La model card indica que Windows Defender o SmartScreen pueden alertar; el autor sugiere ignorar esas alertas, lo que constituye una señal de alarma.
- Uso en juego multijugador: probable incumplimiento de los términos de servicio de *Liar's Bar* y de las políticas de las plataformas de distribución.
- Licencia MIT declarada sin código fuente ni aviso de copyright verificable; la cobertura legal del binario es dudosa.
- Idiomas: las etiquetas de idioma no implican soporte real de ningún tipo.
- Sin mantenimiento verificable: cero descargas y cero likes en el momento de la consulta; creado y actualizado el mismo día (2026-11-24).
- No apto para producción, investigación ni entornos corporativos.

## Enlaces

- Hugging Face: https://huggingface.co/Ryuk2kc/liars-bar-cheat-esp-keyless
- Repositorio de releases citado en la model card: https://github.com/MichelChevalier09/liars-bar-cheat-esp-keyless/releases/latest
- Descarga directa citada en la model card: https://github.com/MichelChevalier09/liars-bar-cheat-esp-keyless/releases/latest/download/liars-bar-cheat-esp-keyless-v1.2.0-win64.zip
- Paper: no disponible
- Blog o demo: no disponible
