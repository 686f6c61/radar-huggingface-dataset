# mahf708/e3smv3-lr-hist-samudrace

## Resumen

e3smv3-lr-hist-samudrace es un conjunto de emuladores acoplados atmósfera-océano de una simulación histórica de E3SMv3, publicado por el usuario mahf708 en HuggingFace. No es un modelo de lenguaje: combina la arquitectura ACE para la atmósfera (operador neuronal de Fourier esférico, spherical Fourier neural operator) con la arquitectura Samudra para el océano (U-Net), acopladas mediante `fme.coupled` siguiendo el esquema de SamudrACE. El modelo card indica explícitamente que no se trata de un lanzamiento de Ai2 y que no está respaldado por los desarrolladores de ACE ni de Samudra.

El repositorio se distribuye como prerelease para pruebas, ocupa 226,7 GB y contiene tres variantes de acoplamiento: C0A0 (sin entrada de CO2 ni aerosoles), C1A0 (con CO2) y C1A1 (con CO2 y aerosoles, en tres configuraciones temporales distintas). El estado acoplado compartido comprende 38 variables atmosféricas y 80 oceánicas, incluidas fracción y volumen de hielo marino y 19 capas oceánicas hasta 6380 m. Está pensado para emular una simulación histórica de E3SMv3 con rejilla gaussiana de 1 grado (180 x 360), paso acoplado de 5 días y calendario noleap.

Su relevancia actual radica en la emulación climática de bajo coste computacional: permite generar realizaciones de un modelo terrestre completo (atmósfera, océano y hielo marino) sin ejecutar el modelo físico, con forzamientos disponibles de 1940 a 2064. Al ser una prerelease, los autores advierten de que los ficheros y el historial pueden cambiar y piden contacto antes de publicar resultados basados en estos modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida acoplada: atmósfera ACE (spherical Fourier neural operator) + océano Samudra (U-Net), unidas mediante `fme.coupled` estilo SamudrACE |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (emulador numérico; la ventana temporal la fija la configuración de simulación) |
| Tipos de cuantizacion | no disponible (los checkpoints se publican como ficheros `.tar`) |
| Idiomas soportados | no aplicable (no procesa texto; produce campos numéricos climáticos) |
| Licencia | BSD-3-Clause |
| Formato de pesos | Checkpoints `.tar` (C0A0.tar, C1A0.tar, C1A1.tar) cargados por la librería `fme` |
| Variantes publicadas | C0A0, C1A0, C1A1 (opciones de aerosol `60mo`, `12mo`, `01mo`) |
| Variables de estado acoplado | 38 atmosféricas, 80 oceánicas (incluye fracción y volumen de hielo marino; 19 capas oceánicas hasta 6380 m) |
| Rejilla | Gaussiana de 1 grado (180 x 360) |
| Resolución temporal | Atmósfera cada 6 horas; océano en medias de 5 días; 1 paso acoplado = 5 días = 20 pasos atmosféricos |
| Calendario | noleap |
| Cobertura de forzamiento | 1940-2064, un fichero por año y tipo |
| Condiciones iniciales incluidas | 1985-01-01 (índice 0) y 2015-01-01 (índice 1) |
| Tamaño del repositorio | 226,7 GB |
| Librería | `fme` |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La componente atmosférica emplea ACE, un operador neuronal de Fourier sobre esfera que opera en la rejilla gaussiana de 1 grado, mientras que la componente oceánica emplea Samudra, una U-Net que predice el estado oceánico y el hielo marino. Ambas se entrenaron con salidas de E3SMv3 por el equipo de E3SM y se acoplan a través de `fme.coupled`, de forma análoga a SamudrACE. El estado acoplado es único para las tres variantes: 38 variables atmosféricas y 80 oceánicas, e incluye la fracción de hielo marino y la fracción oceánica que ve la atmósfera, ambas procedentes de la predicción del propio océano. La atmósfera es estocástica: las configuraciones fijan `seed: 0` y permiten generar otras realizaciones cambiando la semilla o `n_ensemble_per_ic`.

Los datos de entrenamiento provienen de la simulación E3SMv3 `v3.LR.historical_0101`, reejecutada con salida en línea para el emulador (`v3.LR.historical_0101.aigo`). La salida de EAM se remapeó desde ne30pg2, y la de MPAS-Ocean y MPAS-Seaice desde IcoswISC30E3r5 mediante un mapa bilineal (trintbilin), hasta la rejilla gaussiana de 1 grado. Las tres variantes se diferencian en el forzamiento externo que consumen: C0A0 lee SOLIN, PHIS y LANDFRAC; C1A0 añade `global_mean_co2`; C1A1 añade además dos diagnósticos de aerosoles de EAM (`aerindexall` y `colccn.3`) suavizados de tres formas alternativas sobre datos de 6 horas (medias mensuales centradas de 5 años más su ciclo diurno medio; media móvil centrada de 12 meses más ciclo estacional y diurno medios de 5 años; interpolación entre medias mensuales del año más el ciclo diurno medio del mes). No se documentan en la información disponible detalles sobre el número de tokens o épocas de entrenamiento ni sobre uso de RLHF o DPO.

## Capacidades

- Emulación acoplada atmósfera-océano-hielo marino: reproduce la evolución de un estado de 118 variables (38 atmosféricas y 80 oceánicas) a lo largo de pasos acoplados de 5 días.
- Integración de forzamientos externos: las variantes C1A0 y C1A1 aceptan CO2 global medio y, en el caso de C1A1, índices de aerosoles, lo que permite explorar sensibilidad a forzamientos.
- Generación de ensembles: al ser la atmósfera estocástica, admite múltiples realizaciones mediante `seed` y `n_ensemble_per_ic`.
- Simulación multi-anual: la configuración por defecto ejecuta 10 años (730 pasos acoplados de 5 días) desde la condición inicial; las condiciones iniciales disponibles son 1985-01-01 y 2015-01-01.
- Salida de medias mensuales: genera medias mensuales de todas las variables en `results/{flavor}/atmosphere/monthly_mean_predictions.nc` y `ocean/monthly_mean_predictions.nc`.
- Escritura de estado final: guarda el estado al final de la ejecución en `restart.nc`, lo que permite encadenar tramos.
- Verificación de reproducibilidad: el script de smoke test ejecuta cada variante 10 días dos veces con `seed: 0` y comprueba finalización, repetición bit a bit y NaNs solo donde los hay en la condición inicial.
- No dispone de tool calling, function calling, razonamiento multi-paso, capacidades multilingües ni modo de pensamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Exploración de escenarios climáticos históricos y futuros: ejecutar la variante C1A1 con las opciones de aerosol `60mo`, `12mo` o `01mo` para comparar cómo cambia la respuesta del sistema acoplado según el tratamiento temporal del forzamiento.
- Generación de ensembles para análisis de incertidumbre: fijar `n_ensemble_per_ic` y distintas semillas para obtener varias realizaciones del mismo periodo y estimar la dispersión interna del sistema emulado.
- Emulación de periodos largos a bajo coste: ejecutar décadas de simulación acoplada sin invocar el modelo físico completo, útil para estudios que requieren muchas réplicas o barridos de parámetros.
- Encadenamiento de tramos con `restart.nc`: continuar una simulación desde el estado final de una ejecución previa (por ejemplo, empezar en 1985 y extender hasta 2064 con los forzamientos disponibles).
- Generación de datos sintéticos para entrenamiento de modelos auxiliares: producir campos mensuales de atmósfera y océano que sirvan como conjunto de datos para downscaling estadístico o para modelos de emulación secundarios.
- Comparación con la simulación de referencia E3SMv3: usar el emulador como referencia rápida frente a `v3.LR.historical_0101` en estudios de sesgo y de fidelidad de emuladores.
- Docencia y reproducción rápida: el notebook de Colab descarga lo necesario para C1A0, ejecuta 40 días desde 1985-01-01 y representa la salida, lo que permite demostrar el flujo de trabajo en un entorno con GPU.
- Validación de infraestructura de acoplamiento: usar el smoke test (10 días, dos ejecuciones por variante, ~8 GB de descarga) como comprobación de que la instalación de `fme` y los checkpoints funcionan en un entorno nuevo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La información disponible únicamente describe dos comprobaciones funcionales, no comparativas: el smoke test (ejecución de 10 días por variante, repetida dos veces con `seed: 0`, verificando finalización, repetición bit a bit y ausencia de NaNs salvo donde los hay en la condición inicial) y la ejecución de referencia del notebook de Colab (40 días desde 1985-01-01 con C1A0). No se aportan métricas de error frente a la simulación E3SMv3 de referencia ni comparaciones numéricas con SamudrACE.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La información proporcionada no especifica memoria de GPU necesaria para ninguna de las variantes.
- GPU recomendadas: no disponible. El notebook de Colab indica únicamente que se seleccione un entorno de ejecución con GPU.
- Compatibilidad con GPU de consumo: no disponible; no se documenta si las variantes caben en GPUs de consumo ni en cuáles.
- Almacenamiento: el repositorio completo ocupa 226,7 GB. Una ejecución de la walkthrough 1 (checkpoint C1A0, configuraciones, condiciones iniciales y forzamiento 1985-1995) requiere unos 4,4 GB de descarga; el smoke test descarga unos 8 GB.
- Salida en disco: cada ejecución de 10 años produce aproximadamente 4,4 GB de medias mensuales, además del `restart.nc`.
- Opciones de despliegue: la vía documentada es `fme` instalado con pixi desde el repositorio `E3SM-Project/ace`, rama `e3sm/release/e3smv3-lr-hist-samudrace`, y ejecución mediante `python -m fme.coupled.inference configs/<flavor>.yaml`. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Rejilla / acoplamiento | Forzamientos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e3smv3-lr-hist-samudrace | Emulador acoplado atmósfera-océano (ACE + Samudra, vía `fme.coupled`) | Gaussiana 1 grado; atmósfera 6 h, océano 5 días | CO2 y aerosoles según variante; 1940-2064 | BSD-3-Clause | HuggingFace, prerelease, 226,7 GB |
| SamudrACE | Emulador acoplado atmósfera-océano con el mismo esquema de acoplamiento | no disponible | no disponible | no disponible | referenciado en la model card |
| ACE (Ai2) | Emulador atmosférico (spherical Fourier neural operator) | no disponible | no disponible | no disponible | referenciado en la model card |
| Samudra (Ai2) | Emulador oceánico (U-Net) | no disponible | no disponible | no disponible | referenciado en la model card |

Los tres modelos comparables se mencionan en la propia model card como origen de las arquitecturas empleadas y como esquema de acoplamiento de referencia. La información disponible no incluye parámetros, contexto, resultados de rendimiento ni licencia de esas alternativas, por lo que no es posible una comparación cuantitativa.

## Limitaciones y advertencias

- Es una prerelease explícita: los autores advierten de que los ficheros y el historial pueden cambiar y piden contacto antes de publicar resultados que usen estos modelos.
- No es un lanzamiento de Ai2 y no está respaldado por los desarrolladores de ACE ni de Samudra; la atribución debe hacerse al equipo de E3SM y al autor del repositorio.
- El alcance está acotado a la emulación de una única simulación de referencia (`v3.LR.historical_0101` / `v3.LR.historical_0101.aigo`); no se documenta su validez fuera de ese escenario.
- Componente atmosférica estocástica: los resultados dependen de `seed`; reproducir exactamente una ejecución exige mantener semilla y configuración.
- Los forzamientos deben ser contiguos y con el mismo año inicial para todos los tipos, lo que impone disciplina en la preparación de datos de entrada.
- Los ficheros de forzamiento cubren 1940-2064, lo que limita cualquier extensión más allá de ese rango.
- Las variantes C1A1 dependen de dos diagnósticos de aerosoles de EAM tratados con suavizados alternativos; la elección entre `60mo`, `12mo` y `01mo` afecta a la entrada del modelo y debe justificarse.
- Uso comercial: la licencia BSD-3-Clause permite uso comercial con obligación de conservar el aviso de copyright y la cláusula de exención de responsabilidad, pero la condición de prerelease y la falta de validación publicada desaconsejan su uso en producción sin verificación propia.
- Riesgo de alucinación: no aplica en el sentido habitual; el riesgo equivalente es la deriva del emulador respecto al modelo físico, cuya magnitud no se cuantifica en la información disponible.
- Sesgos conocidos: no disponible. No se documentan análisis de sesgo del emulador frente a la referencia.
- Idiomas: no aplicable; el modelo no procesa ni genera texto.
- No se especifican requisitos de VRAM, GPU compatibles, latencia ni throughput, lo que dificulta planificar el despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahf708/e3smv3-lr-hist-samudrace
- Notebook de inicio rápido en Colab: https://colab.research.google.com/#fileId=https%3A//huggingface.co/mahf708/e3smv3-lr-hist-samudrace/blob/main/notebooks/colab_quickstart.ipynb
- Script de smoke test: https://huggingface.co/mahf708/e3smv3-lr-hist-samudrace/resolve/main/scripts/smoke_test.py
- Repositorio del código `fme` (rama de esta publicación): https://github.com/E3SM-Project/ace
- Instalador de pixi: https://pixi.sh/install.sh
- Proyecto E3SM: https://e3sm.org
