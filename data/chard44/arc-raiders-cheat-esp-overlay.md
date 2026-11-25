# chard44/arc-raiders-cheat-esp-overlay

## Resumen

El repositorio `chard44/arc-raiders-cheat-esp-overlay` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete de software etiquetado como "cheat ESP overlay" para el videojuego Arc Raiders. El autor, chard44, lo publica con licencia MIT y lo describe como una utilidad portable para Windows 10 y Windows 11 de 64 bits, distribuida como archivo ejecutable y comprimido de aproximadamente 4,8 MB. La model card incluye instrucciones de descarga, una contraseña de descompresión y referencias cruzadas a repositorios de GitHub de terceros con nombres no coincidentes.

Desde la perspectiva de la evaluacion de modelos, el artefacto carece de cualquier componente de aprendizaje automatico: no hay arquitectura de red neuronal, pesos, tokenizador ni pipeline de inferencia declarado. Las etiquetas de idioma (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) parecen referirse a la interfaz del programa y no a capacidades linguisticas de un modelo. Su relevancia para desarrolladores e investigadores es nula en el ambito de IA; se documenta aqui unicamente para dejar constancia de que no se trata de un modelo y advertir de los riesgos asociados a la ejecucion de binarios de procedencia no verificada.

La ficha se limita, por tanto, a reflejar los datos disponibles en la model card y a senalar las inconsistencias y riesgos detectados, sin atribuir al artefacto capacidades de las que no hay evidencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun etiquetas del autor) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion como `.zip` con binario `.exe`) |

## Arquitectura y entrenamiento

No existe arquitectura de modelo que describir. El artefacto es un binario para Windows x64 (`inzoi-cheat-trainer-mod-menu-v1.2.2-win64.exe`, build `v3.1.1` / `B67240`) empaquetado en un ZIP de 4,8 MB protegido con la contraseña `2026`. La model card menciona modulos funcionales propios de un overlay de juego (cajas 2D/3D, esqueletos de huesos, radar, filtro de loot, escaneo de offsets), ninguno de ellos relacionado con entrenamiento, datos o inferencia neuronal.

No hay informacion sobre conjuntos de datos, tokens de entrenamiento, tecnicas de alineacion (RLHF, DPO) ni innovaciones de arquitectura. Cualquier afirmacion en ese sentido seria inventada.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision o audio.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue en el sentido de procesamiento de lenguaje natural; las etiquetas de idioma corresponden presumiblemente a la localizacion de la interfaz del programa.
- El autor describe funcionalidades de overlay (ESP, radar, filtro de items), que no constituyen capacidades de un modelo de IA.

## Casos de uso

- No procede: el artefacto no es un modelo de IA y no admite los casos de uso habituales (generacion de texto, codigo, atencion al cliente, RAG, agentes, etc.).
- Cualquier uso del binario queda fuera del ambito de esta ficha tecnica de modelos.
- No se identifican escenarios legitimos de aplicacion en desarrollo o investigacion de IA.
- No se recomienda su descarga ni ejecucion: procede de un repositorio sin descargas ni validacion de la comunidad (0 descargas, 0 likes en el momento de la consulta).
- La model card enlaza a repositorios de GitHub de terceros con nombres que no coinciden con el proyecto (`inzoi-cheat-trainer-mod-menu`), lo que constituye una senal de alarma.
- No se debe ejecutar el `.exe` como administrador ni introducir la contrasena indicada en un equipo de produccion o de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el artefacto se distribuye como ejecutable de Windows.
- Latencia y throughput: no disponibles; el autor menciona cifras de sondeo (`272 Hz`) y tiempos de respuesta (`< 32 ms`) para el overlay, sin metodologia verificable.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable, dado que el artefacto no es un modelo de IA.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no procesa lenguaje natural ni ofrece inferencia.
- Riesgo de seguridad elevado: se trata de un binario `.exe` de procedencia no verificada, distribuido con contrasena y con instrucciones para ejecutarlo como administrador.
- Inconsistencias en la model card: el nombre del proyecto, el nombre del binario y los repositorios de GitHub enlazados no coinciden entre si.
- Cero descargas y cero interacciones en Hugging Face en el momento de la consulta, lo que impide cualquier validacion por parte de la comunidad.
- La licencia MIT declarada no exime de posibles reclamaciones de terceros por el uso de marcas o software de terceros (Arc Raiders es un titulo de terceros).
- Uso potencialmente contrario a los terminos de servicio del videojuego y a la legislacion aplicable en materia de trampas en linea.
- Riesgo de malware: los ejecutables con contrasena y distribucion via enlaces externos son un vector habitual de troyanos y stealers.
- No apto para produccion, investigacion ni entornos corporativos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chard44/arc-raiders-cheat-esp-overlay
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu
- Repositorio de GitHub referenciado en la model card (no verificado): https://github.com/LievePapadopoulos91/arc-raiders-cheat-esp-overlay
- Paper, blog o demo: no disponible
