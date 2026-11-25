# leomx31/deadlock-hack-script

## Resumen

El artefacto publicado bajo el identificador `leomx31/deadlock-hack-script` en Hugging Face no es un modelo de inteligencia artificial. Se trata de un paquete ejecutable para Windows etiquetado como script de trampas para el videojuego Deadlock, distribuido como archivo ZIP de 4,8 MB con un binario `rob-run-cheat-mod-menu-2026-v1.2.2-win64.exe`. La model card no documenta ninguna arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia; el campo `pipeline` aparece como no disponible y las etiquetas describen plataformas y funcionalidades de trampa, no capacidades de modelado del lenguaje.

El repositorio no contiene parámetros, capas, ventana de contexto ni datos de entrenamiento. Los idiomas listados (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) corresponden a los idiomas de la interfaz o de la documentación del ejecutable, no a un corpus multilingüe de entrenamiento. La licencia declarada es MIT, aunque su aplicabilidad a un binario de terceros sin código fuente verificable es cuestionable.

Desde el punto de vista de evaluación de modelos, esta ficha debe leerse como una advertencia: el artefacto no es apto para ningún caso de uso de IA y su descarga implica ejecutar código opaco con privilegios de administrador en sistemas Windows 10/11 de 64 bits. Cualquier despliegue, benchmarking o integración en pipelines de inferencia es inviable por definición, ya que no existe un modelo subyacente que evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; binario ejecutable para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de interfaz/documentación, no de entrenamiento) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como ZIP con ejecutable `.exe`; sin safetensors, GGUF ni binarios de pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. La documentación del autor menciona un ejecutable de 4,8 MB con módulos denominados "2D radar & loot filter", "bezier input smoothing", "dynamic offset scanner", "external overlay a 144 Hz", "panic key unload" y "stream-proof render layer", todos orientados a manipular el proceso del videojuego Deadlock en Windows. No se documentan tokens de entrenamiento, composición de dataset, RLHF, DPO ni ninguna técnica de aprendizaje automático.

La única innovación técnica declarada es de naturaleza ofuscatoria: un escáner dinámico de offsets que resuelve firmas de punteros tras parches del juego y una capa de render que intenta excluirse de capturas de OBS, ShadowPlay y Discord. Nada de esto constituye una contribución al campo de la IA open source ni es reproducible sin ingeniería inversa del binario.

## Capacidades

- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No dispone de tool calling ni function calling.
- No dispone de soporte de agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües en el sentido de procesamiento de lenguaje natural.
- No dispone de modo de pensamiento (thinking mode), audio ni ninguna otra capacidad de modelo.
- Funcionalidad declarada por el autor: superposición externa con cajas 2D/3D y esqueletos óseos, radar 2D con filtrado de botín, suavizado de entrada por curvas de Bézier, escáner de offsets y tecla de pánico `END`.

## Casos de uso

- No procede ningún caso de uso legítimo de IA. El artefacto no es un modelo y no puede integrarse en pipelines de inferencia, RAG, generación de código ni agentes.
- Evaluación de seguridad defensiva: analistas de malware pueden diseccionar el binario en un entorno aislado para estudiar técnicas de ofuscación y evasión de capturas, documentando indicadores de compromiso.
- Investigación de integridad en videojuegos: equipos anti-cheat pueden usar muestras como esta para calibrar detección de superposiciones externas y escáneres de offsets.
- Formación en concienciación: instructores pueden mostrar el patrón típico de ingeniería social (contraseña fija `2026`, instrucciones para desactivar SmartScreen, descarga desde repositorios de terceros) como ejemplo de distribución de software malicioso.
- Auditoría de cadena de suministro: revisar cómo un repositorio de Hugging Face puede alojar artefactos ajenos a la plataforma y qué controles de licencia y procedencia deberían aplicarse.
- Documentación de políticas: responsables de compliance pueden usar este caso para justificar listas de bloqueo de dominios y binarios en entornos corporativos.

En ningún caso debe ejecutarse en máquinas de producción, estaciones de desarrollo con credenciales ni sistemas con datos sensibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni equivalentes porque no hay modelo subyacente. Los únicos números que aparecen en la documentación (168 Hz de sondeo, 98,5 % de consistencia del escáner de offsets, menos de 12 ms de respuesta al unload, menos de 38 MB de RAM, 7 y 14 hilos de trabajo) son afirmaciones del autor sobre el comportamiento del ejecutable, no resultados reproducibles de evaluación de modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay modelo que cargar en memoria de GPU.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo requerido por el artefacto: Windows 10/11 de 64 bits, según la documentación del autor.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput de inferencia: no disponibles; los valores citados por el autor corresponden a un proceso de manipulación de juego, no a decodificación de tokens.

## Comparativa con modelos similares

No disponible. No existe categoría de modelos comparable porque el artefacto no es un modelo de IA. Cualquier comparación con modelos de lenguaje, visión o agentes sería espuria. A modo de contraste conceptual, los artefactos legítimos de Hugging Face incluyen pesos en safetensors o GGUF, tokenizador, configuración de arquitectura y métricas reproducibles; este paquete no contiene ninguno de esos elementos.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador, configuración ni código de inferencia; no puede evaluarse con herramientas estándar como `lm-evaluation-harness`.
- Riesgo de seguridad alto: distribución de un ejecutable opaco que solicita ejecución como administrador y sugiere desactivar Windows Defender o SmartScreen, patrón habitual de malware.
- Contraseña fija y pública (`2026`): práctica que impide verificación de integridad y facilita redistribución maliciosa.
- Procedencia dudosa: el identificador del repositorio de Hugging Face (`leomx31`) no coincide con los repositorios de GitHub referenciados (`raulw06`, `JoaoSchaefer973`), lo que sugiere cadena de suministro no verificable.
- Licencia MIT declarada sin código fuente auditable: la aplicabilidad de la licencia a un binario de terceros es jurídicamente dudosa y no ofrece garantías de uso comercial seguro.
- Posible violación de términos de servicio del videojuego Deadlock y de la legislación aplicable sobre trampas en entornos multijugador.
- Idiomas listados como metadatos de interfaz, no como capacidades de procesamiento multilingüe; no debe interpretarse como soporte de NLP.
- Sesgos y alucinación: no aplica en el sentido de modelos generativos, pero la documentación contiene afirmaciones no verificables (descargas de 457K+, consistencia del 98,5 %) que pueden inducir a error.
- Para producción: bloqueo recomendado en cortafuegos, filtros de reputación de dominios y políticas de endpoint que impidan la ejecución de binarios descargados desde Hugging Face sin verificación de firma.

## Enlaces

- Hugging Face: https://huggingface.co/leomx31/deadlock-hack-script
- Repositorio GitHub referenciado en la model card: https://github.com/raulw06/deadlock-hack-script
- Releases del repositorio anterior: https://github.com/raulw06/deadlock-hack-script/releases/latest
- Repositorio GitHub del paquete: https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026
- Descarga directa citada por el autor (no recomendada): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
