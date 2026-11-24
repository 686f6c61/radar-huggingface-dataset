# KevaoGG/murderers-vs-sheriffs-script

## Resumen

El repositorio `KevaoGG/murderers-vs-sheriffs-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial, sino un paquete ejecutable para Windows x64 etiquetado como script para el juego *Murderers Vs Sheriffs*. La model card se presenta como una guía de descarga de un binario (`murderers-vs-sheriffs-script-v1.2.0-win64.exe`, build `4A513A`, 8,9 MB) distribuido en un archivo ZIP protegido con contraseña, con instrucciones para ejecutarlo como administrador y desactivar advertencias de Windows Defender o SmartScreen.

El contenido describe funcionalidades propias de un *cheat* de videojuego: escáner dinámico de offsets en memoria, overlays externos con cajas delimitadoras y esqueletos, radar 2D con filtro de objetos por rareza, *smoothing* de entrada con curvas de Bézier y capas de exclusión de captura de pantalla para OBS, ShadowPlay y Discord. No hay ninguna referencia a pesos, arquitectura de red neuronal, tokenizador, dataset de entrenamiento ni pipeline de inferencia.

Por tanto, esta ficha no puede evaluar un modelo de IA: no existe información técnica que lo respalde y el propio material apunta a un ejecutable de terceros con fines de trampa en un juego. Se documenta lo disponible y se marcan explícitamente como "no disponible" todos los parámetros propios de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; paquete ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según etiquetas del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribución como `.exe` y `.zip` para Windows x64) |

## Arquitectura y entrenamiento

No aplica. El repositorio no contiene un modelo entrenado ni información sobre arquitectura de red, datos de entrenamiento, número de tokens, composición del corpus, RLHF, DPO ni ninguna innovación de inferencia (decodificación especulativa, atención lineal, etc.). El material describe un binario para Windows con módulos de manipulación de memoria y renderizado superpuesto, sin relación con aprendizaje automático.

La model card menciona componentes como un escáner de offsets dinámico, perfiles JSON intercambiables en caliente, capa de renderizado excluida de capturas, overlay externo a 144 Hz o más, radar 2D con filtrado de objetos y suavizado de entrada con curvas de Bézier sobre diez hilos de trabajo. Son descripciones de un *cheat*, no de un modelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no resuelve problemas matemáticos ni escribe código.
- No soporta *tool calling* ni *function calling*.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües en el sentido de un modelo; los idiomas listados son etiquetas del repositorio.
- No dispone de modo *thinking*, visión, audio ni ninguna capacidad cognitiva.
- El binario, según su propia descripción, ofrece overlays y manipulación de memoria orientados a un videojuego.

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que describe el propio material son:

- Uso del ejecutable como *cheat* en el juego *Murderers Vs Sheriffs*, con overlays y radar: actividad contraria a las condiciones de servicio habituales de los videojuegos y potencialmente sancionable.
- Distribución de un binario protegido con contraseña y ejecución como administrador: patrón de riesgo de seguridad para el usuario final.
- Exclusión de captura en OBS, ShadowPlay y Discord: pensado para dificultar la detección en grabaciones o transmisiones.
- Intercambio de perfiles JSON entre configuraciones "Legit", "Visual" y "Custom": orientado a modular el comportamiento del *cheat*.
- Ejecución en equipos Windows x64 de Intel y AMD: único requisito declarado.
- No se recomienda ninguno de estos usos en un contexto profesional, de investigación o de producción de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de modelos (MMLU, HumanEval, GSM8K u otras), y las cifras que aparecen en la model card (99,3 %, 98,4 %, 423 Hz, menos de 32 ms) son afirmaciones del autor sobre el funcionamiento del ejecutable, no resultados verificables de un modelo.

## Requisitos de hardware

- VRAM estimada: no aplica (no es un modelo de IA).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo declarado: Windows x64 (incluido Windows 11 según etiquetas).
- Opciones de despliegue: no aplica (no hay integración con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables ni corresponden a inferencia de modelos.

## Comparativa con modelos similares

No disponible. No existe una categoría de modelos de IA comparable porque el artefacto no es un modelo. Cualquier comparación con modelos de lenguaje, visión o multimodal sería improcedente.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA; tratarlo como tal es un error de clasificación.
- El binario se distribuye como ejecutable para Windows con contraseña de extracción y se pide ejecutarlo como administrador, lo que supone un riesgo elevado de seguridad.
- La model card reconoce explícitamente que se trata de un *game cheat* y recomienda desactivar o evitar alertas de Windows Defender y SmartScreen, práctica desaconsejada.
- La licencia MIT declarada cubre el repositorio, pero no legitima el uso del binario frente a las condiciones del videojuego ni frente a la legislación aplicable.
- No hay evidencia de auditoría, código fuente, reproducibilidad ni métricas verificables.
- Cero descargas y cero *likes* en el momento de la consulta: sin validación por parte de la comunidad.
- Fecha de creación y actualización declarada: 2026-11-24 (según metadatos del repositorio).
- No debe utilizarse en entornos de producción, investigación ni desarrollo de IA.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/KevaoGG/murderers-vs-sheriffs-script
- Repositorio referenciado en la model card (GitHub): https://github.com/nCox6608/murderers-vs-sheriffs-script
- Descarga del archivo ZIP citado en la model card: https://github.com/nCox6608/murderers-vs-sheriffs-script/releases/latest/download/murderers-vs-sheriffs-script-v1.2.0-win64.zip
- Página de releases citada en la model card: https://github.com/nCox6608/murderers-vs-sheriffs-script/releases/latest

Nota: los enlaces se incluyen por completitud documental a partir del material proporcionado; no se recomienda su descarga ni ejecución.
