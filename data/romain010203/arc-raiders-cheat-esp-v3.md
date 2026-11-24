# Romain010203/arc-raiders-cheat-esp-v3

## Resumen

El identificador `Romain010203/arc-raiders-cheat-esp-v3` no corresponde a un modelo de inteligencia artificial, sino a un repositorio alojado en Hugging Face cuyo contenido es un supuesto ejecutable para Windows distribuido como archivo ZIP (`solara-executor-v3-keyless-2026-v1.2.2-win64.zip`, 4,8 MB). La model card describe funciones de trampa (ESP, overlay, suavizado de entrada, exclusión de captura de pantalla) para el videojuego *Arc Raiders*, no capacidades de modelado de lenguaje, visión o generación.

Desde la perspectiva de un catálogo de modelos open source, esta ficha no puede completarse con parámetros de arquitectura neuronal, contexto, cuantización ni benchmarks, porque el artefacto no es un modelo. El repositorio se publicó el 24 de noviembre de 2026, acumula 0 descargas y 0 likes, y la única licencia declarada es MIT.

Se documenta aquí con el mismo rigor que el resto de fichas para dejar constancia explícita de que se trata de un artefacto ajeno a la categoría de modelos de IA, y para advertir de los riesgos asociados a la distribución de binarios de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; la model card describe un ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (etiquetas de idioma del repositorio, no capacidades del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto es un ZIP con un `.exe`; no hay pesos en safetensors ni GGUF) |

## Arquitectura y entrenamiento

No hay arquitectura neuronal que describir. La model card no documenta un transformer, un modelo MoE, un SSM ni ningún otro diseño de red. El contenido declarado es un binario `solara-executor-v3-keyless-2026-v1.2.2-win64.exe` (build `v1.8.9`, `3EFEB92719`) empaquetado en un ZIP protegido con contraseña, junto con perfiles JSON de configuración.

Tampoco existen datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF o DPO. Las cifras que aparecen en la model card (polling a 336 Hz, 295 Hz, 181 Hz, 11 hilos de trabajo, latencia menor de 22 ms, consistencia del 97,2 %) son afirmaciones del autor sobre el comportamiento del ejecutable, sin verificación independiente y sin relación con métricas de evaluación de modelos.

## Capacidades

- No se documenta generación de texto, razonamiento, código, matemáticas ni visión.
- No hay soporte de tool calling ni function calling.
- No hay capacidades de agentes ni de razonamiento multi-paso.
- No hay capacidades multilingües reales; las etiquetas de idioma del repositorio son metadatos de búsqueda.
- La model card atribuye al ejecutable funciones de overlay externo, cajas delimitadoras 2D/3D, esqueletos de huesos, ESP de distancia, suavizado de entrada tipo Bézier y exclusión de captura de pantalla. Estas funciones son ajenas a la inferencia de modelos y no constituyen capacidades de IA.

## Casos de uso

- No se identifican casos de uso legítimos como modelo de IA: el artefacto no procesa lenguaje, no genera contenido y no expone una API de inferencia.
- Integración en pipelines de generación de código: no aplica, no hay modelo que invocar.
- Atención al cliente o asistentes conversacionales: no aplica, no hay capacidad conversacional.
- Análisis de documentos o RAG: no aplica, no hay ventana de contexto ni embeddings.
- Evaluación comparativa de modelos: no aplica, no hay pesos ni tokenizador.
- Uso educativo o de investigación en IA: no aplica; el contenido es un ejecutable para Windows.
- Auditoría de seguridad: el único uso técnico razonable sería el análisis estático del binario en un entorno aislado, con fines de investigación de malware y sin ejecutarlo en sistemas de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye cifras operativas del ejecutable (frecuencias de polling, latencia menor de 22 ms, 11 hilos, consistencia del 97,2 %), pero no son benchmarks de modelos de IA y no se han verificado de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada del artefacto: Windows 10/11 de 64 bits, con ejecución como administrador.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): ninguna; el artefacto no es compatible con servidores de inferencia.
- Latencia y throughput: no disponibles como métricas de modelo; las cifras de la model card corresponden al ejecutable y no son verificables.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable, porque el artefacto no es un modelo. Frente a modelos de lenguaje open source reales (por ejemplo, familias tipo Llama, Mistral o Qwen), la diferencia no es de rendimiento sino de naturaleza: aquellos publican pesos, tokenizador y configuración; este repositorio publica un ZIP con un ejecutable.

## Limitaciones y advertencias

- No es un modelo de IA: no debe registrarse ni evaluarse como tal en catálogos de modelos.
- El artefacto se distribuye como binario `.exe` dentro de un ZIP protegido con contraseña, un patrón habitual en campañas de distribución de malware; no hay verificación de integridad, firma de código ni análisis público.
- La model card incluye enlaces a repositorios de GitHub de terceros y contraseñas de descompresión, lo que dificulta la trazabilidad del contenido real del binario.
- El uso descrito (trampas en un videojuego multijugador) puede infringir los términos de servicio del juego y la legislación aplicable en materia de trampas y fraude informático en algunas jurisdicciones.
- La licencia MIT declarada cubre el repositorio, pero no aclara la procedencia del código ni de las dependencias del ejecutable.
- Riesgo de alucinación y sesgos: no aplica como modelo; el riesgo relevante es de seguridad del software.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.
- Recomendación: no ejecutar el binario en sistemas personales o de producción; si se analiza, hacerlo en una máquina virtual o sandbox sin acceso a red ni a credenciales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Romain010203/arc-raiders-cheat-esp-v3
- Repositorio de GitHub citado en la model card (origen del ZIP): https://github.com/schneider6972/solara-executor-v3-keyless-2026
- Releases citadas en la model card: https://github.com/Krzysztof8590/arc-raiders-cheat-esp-v3/releases/latest
- Paper, blog o demo oficiales: no disponible
