# daffy0208/dubai-rp-script-v3

## Resumen

`daffy0208/dubai-rp-script-v3` es un repositorio alojado en Hugging Face que, pese a su ubicación, no contiene un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows (build `v2.9.7`, identificador `242E9F`) distribuido como archivo ZIP de 8,9 MB con contraseña de extracción `2026`, cuyo contenido es un binario `.exe` orientado a la plataforma Windows 10/11 de 64 bits. La model card se limita a describir funcionalidades de un supuesto script para un juego de rol multijugador (overlay externo, radar 2D, filtro de loot, smoothing de entrada por curvas de Bézier y descarga por tecla de pánico).

El repositorio no publica pesos, arquitectura, tokenizador, configuración de entrenamiento ni ningún artefacto propio de un modelo de lenguaje. Los tags de Hugging Face (`windows`, `windows-11`, `x64`, `portable`) y los idiomas declarados (14 códigos ISO) corresponden a metadatos del paquete, no a capacidades lingüísticas de un modelo. La licencia declarada es MIT, aunque el contenido distribuido es un ejecutable cerrado sin código fuente verificable.

Desde la perspectiva de evaluación de modelos, esta ficha no puede cumplir los apartados técnicos habituales porque no existe un modelo subyacente que analizar. Se documenta aquí para dejar constancia de que el artefacto no es apto para ningún flujo de trabajo de IA y presenta características típicas de distribución de software potencialmente malicioso (binario ofuscado, contraseña en el archivo, instrucciones para ejecutar como administrador y desactivar avisos de SmartScreen).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (metadatos del paquete, no capacidades del modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto es un `.zip` de 8,9 MB que contiene un `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto es un binario compilado para Windows (`dubai-rp-script-v3-v1.2.0-win64.exe`) empaquetado en un ZIP protegido con contraseña. La model card menciona componentes como "user-mode external core", "Desktop Duplication rendering", "dynamic offset scanner" y "bezier input smoothing", que son términos propios de herramientas de automatización o trampas para videojuegos, no de modelos generativos.

No se aporta información sobre datos de entrenamiento, número de tokens, composición del corpus, técnicas de alineación (RLHF, DPO) ni innovaciones en atención o decodificación. Cualquier afirmación sobre arquitectura transformer, MoE o SSM sería inventada y no se incluye.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve problemas matemáticos.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües verificables; los códigos de idioma son metadatos del repositorio.
- El binario declara funcionalidades de overlay externo a 144 Hz, radar 2D, filtro de loot por rareza, escáner de offsets dinámicos y descarga por tecla `END`, según la model card.
- No se ha verificado el comportamiento real del ejecutable ni su contenido interno.

## Casos de uso

- Ninguno recomendado en el ámbito de IA. El artefacto no es un modelo y no debe integrarse en pipelines de inferencia, RAG, agentes ni generación de código.
- Evaluación de modelos: no aplica; no hay pesos ni tokenizador que cargar en vLLM, llama.cpp, Ollama o TGI.
- Investigación en seguridad: podría analizarse en un entorno aislado (sandbox, máquina virtual sin red) para caracterizar el binario, pero esto queda fuera del alcance de una ficha de modelo y conlleva riesgos.
- Docencia sobre riesgos de supply chain: sirve como ejemplo de repositorio que abusa de la plataforma Hugging Face para distribuir ejecutables con contraseña y avisos de SmartScreen.
- Automatización de videojuegos: el autor declara ese propósito, pero su uso puede violar los términos de servicio del juego correspondiente y la legislación aplicable.
- Producción: descartado por completo; no hay garantías de integridad, reproducibilidad ni soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas de ningún tipo. Las cifras que aparecen en la model card (`144 Hz`, `192 Hz`, `368 Hz`, `97,6 %` de consistencia, `< 35 MB` de RAM) son afirmaciones del autor sobre el ejecutable, no resultados de benchmarks de un modelo y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10 y Windows 11 de 64 bits (x64).
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; las cifras de polling de la model card no son medibles ni verificables.
- Consumo de disco: 8,9 MB para el ZIP; el tamaño del ejecutable extraído no se detalla.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Compararlo con LLM como Llama, Mistral o Qwen carece de sentido técnico: no comparten tarea, formato ni interfaz. Tampoco se han identificado en la información proporcionada otros repositorios equivalentes de distribución de ejecutables para juegos con los que establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en comparativas de LLM.
- El contenido es un binario `.exe` protegido por contraseña (`2026`) y distribuido fuera de los canales habituales de software; esto impide la inspección previa y es un patrón habitual en campañas de malware.
- La model card incluye instrucciones para ejecutar como administrador y sugiere resolver avisos de Windows Defender o SmartScreen, lo que incrementa el riesgo de seguridad.
- No hay código fuente, hashes verificables ni firmas del binario que permitan auditar su integridad.
- La licencia MIT declarada en los metadatos no garantiza nada sobre el binario, que no incluye aviso de licencia ni código.
- Posible violación de términos de servicio de videojuegos y de la legislación sobre trampas o automatización en entornos multijugador.
- Riesgo de alucinación, sesgos o limitaciones de contexto: no aplica, al no existir modelo generativo.
- Uso comercial: desaconsejado; la licencia declarada no cubre responsabilidades derivadas del ejecutable.
- Se recomienda no descargar ni ejecutar el artefacto y, en su caso, reportar el repositorio a Hugging Face por uso indebido de la plataforma.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/daffy0208/dubai-rp-script-v3
- Repositorio GitHub referenciado en la model card: https://github.com/jasonmatsumoto98803/dubai-rp-script-v3
- Releases del proyecto (según la model card): https://github.com/jasonmatsumoto98803/dubai-rp-script-v3/releases/latest
- Paquete directo citado en la model card (no verificado): https://github.com/jasonmatsumoto98803/dubai-rp-script-v3/releases/latest/download/dubai-rp-script-v3-v1.2.0-win64.zip
- Paper, blog o demo: no disponible.
