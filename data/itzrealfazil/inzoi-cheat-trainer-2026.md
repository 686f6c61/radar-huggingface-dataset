# itzrealfazil/inzoi-cheat-trainer-2026

## Resumen

El artefacto publicado bajo el identificador `itzrealfazil/inzoi-cheat-trainer-2026` no es un modelo de inteligencia artificial ni un conjunto de pesos entrenados. Se trata de un paquete ejecutable para Windows x64 distribuido a traves de un repositorio de Hugging Face, etiquetado como "cheat trainer" para el videojuego InZOI, con un binario comprimido (`inzoi-cheat-trainer-2026-v1.2.0-win64.zip`, 8,9 MB) alojado en un repositorio externo de GitHub.

La model card no contiene informacion sobre arquitectura de red neuronal, parametros, tokenizador, datos de entrenamiento ni proceso de inferencia. Los campos tecnicos habituales (pipeline, formato de pesos, contexto) estan ausentes o no son aplicables. El repositorio declara licencia MIT y una lista de idiomas (en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id) que corresponde a la interfaz del programa, no a capacidades linguisticas de un modelo.

Desde la perspectiva de evaluacion de modelos, este artefacto queda fuera del ambito de la ficha: no hay modelo que evaluar. La ficha se limita a documentar lo que el repositorio declara y a senalar los riesgos de seguridad asociados a la distribucion de ejecutables ofuscados con contrasena desde plataformas no disenadas para binarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (idiomas de interfaz declarados) |
| Licencia | MIT |
| Formato de pesos | no disponible (distribucion en ZIP con contrasena; binario `.exe`) |

## Arquitectura y entrenamiento

No aplica. El artefacto no es un modelo entrenado ni contiene pesos, tokenizador o configuracion de inferencia. La model card describe un programa de escritorio con modulos de "overlay externo", "radar 2D", "smoothing de entrada Bezier", "scanner de offsets dinamicos" y una "panic key" (`END`) para descargar el proceso. Estos terminos corresponden a tecnicas de manipulacion de memoria de procesos (lectura directa de memoria del juego, resolucion de punteros tras parches) y no a componentes de aprendizaje automatico.

No se documenta ningun proceso de entrenamiento, dataset, RLHF, DPO ni innovacion en inferencia. La unica cifra tecnica declarada es un sondeo de `299 Hz` para el modulo de entrada y una latencia de respuesta inferior a `36 ms` para la descarga por panic key, datos no verificables.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues en el sentido de un LLM; los idiomas listados corresponden a la interfaz del ejecutable.
- Declara, segun la model card, funcionalidades de manipulacion de partidas: overlay externo con cajas 2D/3D y esqueletos, radar 2D con filtro de botin, suavizado de entrada y escaneo de offsets.
- Declara una capa de "stream-proof" orientada a excluir la captura en OBS, ShadowPlay y Discord.

## Casos de uso

No se identifican casos de uso legitimos en el ambito de IA open source, desarrollo de software o investigacion. El artefacto se presenta como herramienta de trampas para un videojuego, lo que conlleva:

- Riesgo de baneo de cuentas y de incumplimiento de los terminos de servicio del juego.
- Distribucion de un binario ofuscado con contrasena (`2026`) que impide la inspeccion previa a la ejecucion.
- Ejecucion recomendada "como administrador", lo que amplia el impacto potencial de cualquier codigo malicioso.
- Alojamiento del binario en un repositorio de GitHub de terceros, no en el propio Hugging Face, lo que rompe la trazabilidad de la cadena de suministro.
- Inexistencia de firma de codigo, hash publico ni proceso de verificacion reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas declaradas (`299 Hz` de sondeo, `< 36 ms` de respuesta, `97,5 %` de consistencia en el escaneo de offsets) no son verificables ni comparables con benchmarks de modelos.

## Requisitos de hardware

- Sistema operativo: Windows 10 u 11 de 64 bits (declarado).
- CPU: Intel o AMD x64 (declarado).
- VRAM: no aplica (no hay inferencia de modelo).
- GPU recomendada: no disponible.
- Cabe en GPU de consumo: no aplica.
- Opciones de despliegue: ejecucion directa del binario en Windows; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; las cifras de la model card no son verificables.

## Comparativa con modelos similares

No disponible. No existen modelos de IA comparables porque el artefacto no es un modelo. En la categoria de "trainers" de juegos existen numerosas utilidades de terceros, pero ninguna se publica como modelo en Hugging Face ni admite comparacion en parametros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo de IA: la ficha se incluye unicamente para documentar el artefacto y advertir de su naturaleza.
- Binario ofuscado con contrasena y ejecucion como administrador: superficie de riesgo elevada para el usuario.
- Sin hash, firma ni codigo fuente publicado: imposible verificar que el ZIP contiene lo que la model card afirma.
- Alojamiento fuera de Hugging Face (GitHub de un tercero): riesgo de sustitucion del binario o de retirada del repositorio.
- Uso contrario a los terminos de servicio del videojuego InZOI y potencialmente a la legislacion de algunos paises sobre manipulacion de software.
- La licencia MIT declarada no exime de responsabilidad legal por el uso del programa.
- Cifras de rendimiento y de descargas (`499K+`) no verificables; los badges de la model card son auto-declarados.
- No recomendado su despliegue en entornos corporativos, educativos ni de investigacion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/itzrealfazil/inzoi-cheat-trainer-2026
- Repositorio de GitHub del autor (referenciado en la model card): https://github.com/NicolasHendriks32/inzoi-cheat-trainer-2026
- Release del binario (referenciado en la model card): https://github.com/NicolasHendriks32/inzoi-cheat-trainer-2026/releases/latest
- Paper, blog o demo: no disponible.
