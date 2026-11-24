# Extreme747/basketball-zero-script

## Resumen

El repositorio `Extreme747/basketball-zero-script` alojado en Hugging Face no contiene un modelo de inteligencia artificial. Se trata de una ficha que distribuye un ejecutable para Windows (`basketball-zero-script-v1.2.0-win64.exe`, comprimido en un ZIP de 8,9 MB y protegido con la contraseña `2026`) presentado como un "script" para el videojuego Basketball Zero. La model card describe módulos de overlay externo, ESP con cajas delimitadoras y esqueletos, suavizado de entrada tipo bezier y un escáner dinámico de offsets, es decir, funcionalidades propias de una herramienta de trampas (cheat) para un juego multijugador.

No existe información sobre arquitectura de red neuronal, parámetros, contexto, dataset de entrenamiento ni pesos en formatos safetensors o GGUF. El repositorio no declara pipeline de Hugging Face, no tiene descargas ni likes, y su contenido es ajeno a la categoría de modelos de IA open source. Los tags (`windows`, `x64`, `portable`, `basketball-zero-script`) confirman que se trata de un artefacto binario para Windows, no de un modelo.

Esta ficha se redacta, por tanto, como advertencia técnica: no hay modelo que evaluar, y el material distribuido plantea riesgos de seguridad evidentes (ejecutable de procedencia desconocida, contraseña en el propio README, instrucciones para ejecutar como administrador). Cualquier evaluación de capacidades, benchmarks o requisitos de hardware de inferencia carece de sentido en este caso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Win64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos; el binario no es multilingüe en sentido de NLP) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye un ZIP con un `.exe`, no pesos) |

## Arquitectura y entrenamiento

No aplica. El artefacto es un binario compilado para Windows 10 (22H2) y Windows 11 (24H2) en arquitectura x64, empaquetado en `basketball-zero-script-v1.2.0-win64.zip` (8,9 MB). La model card menciona componentes como un "user-mode external core" con renderizado por Desktop Duplication, un overlay externo a 144 Hz o más, un escáner de offsets y suavizado de entrada con curvas bezier sobre 14 hilos de trabajo. Ninguno de estos elementos constituye un modelo entrenado: son módulos de un programa que interactúa con la memoria de otro proceso.

No hay información sobre tokens de entrenamiento, composición del dataset, RLHF, DPO ni innovaciones de arquitectura de aprendizaje automático. La afirmación de "312 Hz de sondeo" o "97,1 % de consistencia" son cifras de marketing del propio README, no resultados reproducibles ni verificables.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de API de modelos.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües de NLP; los idiomas listados son metadatos del repositorio.
- Funcionalidad declarada por el autor (no verificada): overlay externo con cajas 2D/3D y esqueletos, ESP con distancia, perfiles JSON intercambiables en caliente, suavizado de puntería y exclusión de capturas de pantalla (OBS, ShadowPlay, Discord).

## Casos de uso

No se identifican casos de uso legítimos para un modelo de IA, porque no lo es. Los escenarios que plantea el autor son:

- Uso como herramienta de trampas en el videojuego Basketball Zero, lo que vulnera los términos de servicio del juego y puede conllevar el baneo de la cuenta.
- Distribución de un ejecutable con contraseña incrustada en el README, patrón habitual en campañas de malware que buscan evadir análisis automatizados.
- Ejecución con privilegios de administrador en equipos de terceros, con el riesgo de compromiso del sistema.
- No se recomienda su descarga, instalación ni análisis en máquinas de producción o de trabajo.
- Para investigación de seguridad, el análisis debería hacerse exclusivamente en una máquina virtual aislada y sin credenciales.
- No existe ningún escenario de despliegue en pipelines de IA, CI/CD ni servicio al cliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las cifras del README (144 Hz de overlay, 312 Hz de sondeo, 97,1 % de consistencia, menos de 34 MB de RAM) son afirmaciones del autor sin metodología ni verificación independiente, y no corresponden a métricas de modelos de IA.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles.
- Requisitos del binario según el autor: Windows 10 22H2 o Windows 11 24H2, x64, ejecución como administrador, 7-Zip o WinRAR para extraer el ZIP con la contraseña `2026`.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos similares" porque el artefacto no es un modelo de IA. Compararlo con LLM, modelos de visión o modelos de código sería una categorización errónea.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse, desplegarse ni citarse como tal en contextos de investigación o producción.
- Riesgo de seguridad alto: ejecutable de origen desconocido, distribuido con contraseña en el propio README y con instrucciones para ejecutarse como administrador.
- Posible malware: el patrón (ZIP con contraseña, enlace a un repositorio de GitHub de terceros, badges con cifras infladas) es habitual en distribución de droppers y stealers.
- Uso contrario a los términos de servicio del videojuego Basketball Zero; puede provocar el baneo de cuentas.
- La licencia MIT del repositorio no otorga ninguna garantía sobre el binario ni sobre su comportamiento.
- Los metadatos de idiomas y la licencia no implican que el artefacto sea seguro, auditado ni funcional.
- No existe documentación técnica verificable, ni código fuente, ni hashes públicos que permitan auditar el binario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Extreme747/basketball-zero-script
- Repositorio de GitHub citado en la model card: https://github.com/SergioAoki29404/basketball-zero-script
- Release citada en la model card: https://github.com/SergioAoki29404/basketball-zero-script/releases/latest
- Paquete citado: https://github.com/SergioAoki29404/basketball-zero-script/releases/latest/download/basketball-zero-script-v1.2.0-win64.zip
- Paper, blog o demo oficial: no disponible.
