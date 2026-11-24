# DevDock-AI/Qwen3.8-Flash-Next-Speedy-MTP

## Resumen

Qwen3.8-Flash-Next-Speedy-MTP es un cabezal de borrador (draft head) afinado para decodificacion especulativa sobre el modelo Qwen/Qwen3.8-Flash-Next. Lo desarrolla DevDock-AI y no constituye un modelo generativo autonomo: es un componente auxiliar que acelera la inferencia del modelo principal dentro del motor Speedy. El repositorio ocupa 0,8 GB y solo modifica los pesos densos de la capa MTP; los expertos MoE, el vocabulario de borrador y el indice de tensores se mantienen identicos a los del cabezal original de Qwen.

La relevancia del artefacto es practica: la decodificacion especulativa valida cada token propuesto por el borrador con el modelo principal, de modo que un borrador mejor no altera la calidad de salida, solo reduce el coste por token generado. Segun las mediciones del autor, el cabezal afinado eleva la tasa de aceptacion del 75,8 % al 77,6 % con la cuantizacion Signal AP-Q4_K_XL, y del 74,4 % al 77,8 % con Unsloth UD-Q4_K_XL, traduciendose en ganancias de velocidad de decodificacion de entre el 4,3 % y el 10,3 % segun la configuracion.

El modelo esta orientado a cargas de trabajo de programacion y uso agentico de herramientas, y su licencia es la Qwen Community License 1.0 heredada del modelo base, con los ficheros propios de DevDock-AI bajo MIT. No incluye pesos del modelo principal ni una pipeline de inferencia declarada; su unico proposito es servir como directorio `--mtp` en Speedy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabezal MTP (multi-token prediction) con capa densa y mezcla de expertos, sobre Qwen3.8-Flash-Next |
| Parametros totales | no disponible (el repositorio contiene 0,8 GB de tensores del cabezal, no del modelo completo) |
| Parametros activos | no disponible (el cabezal conserva los expertos MoE del original; no se publica el recuento) |
| Longitud de contexto | no disponible para el cabezal (el preset de evaluacion usa 1M de contexto sobre el modelo principal) |
| Tipos de cuantizacion | Tensores q8_0, bf16 y f32 en formato de runtime Speedy MTP |
| Idiomas soportados | no disponible (hereda el soporte del modelo base, no declarado en la ficha) |
| Licencia | qwen-community-license-1.0 (modelo base); MIT para los ficheros de DevDock-AI |
| Formato de pesos | Directorio de runtime Speedy MTP: `dense.bin`, `experts.bin`, `draft_vocab.bin`, `dense.txt` |

## Arquitectura y entrenamiento

El artefacto es un cabezal MTP que predice varios tokens por paso para alimentar la decodificacion especulativa. Su estructura replica la del borrador original de Qwen: una capa densa con proyecciones de entrada, mezcladores de hiperconexion, atencion, compuerta de enrutamiento y normalizaciones, mas un banco de expertos MoE y un subconjunto de vocabulario de borrador. Solo se reentreno la parte densa; `experts.bin` y `draft_vocab.bin` son byte a byte identicos a los originales, y el cambio relativo L2 por tensor se situa entre 2e-5 y 2e-2, lo que indica un ajuste fino conservador.

El entrenamiento empleo autodestilacion: las salidas del propio Qwen3.8-Flash-Next servido por Speedy sobre sesiones de benchmark de programacion y uso agentico de herramientas. El objetivo declarado es que el borrador prediga lo que el modelo principal realmente escribe en esas tareas, aumentando la aceptacion de tokens propuestos. No se documentan volumen de datos, numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Prediccion multi-token para decodificacion especulativa: propone borradores que el modelo principal valida antes de aceptarlos.
- Aceleracion de decodificacion en cargas de programacion y agenticas, con ganancias medidas de hasta el 15,5 % en prompts largos de 27K tokens.
- Compatibilidad directa con el motor Speedy mediante `--mtp DIR`, `--spec` y `--spec-min-p`.
- Sustitucion directa del cabezal MTP original de Qwen: misma disposicion, mismos tensores, mismos expertos y mismo vocabulario de borrador.
- No altera la salida del modelo principal: la calidad del texto generado queda fijada por Qwen3.8-Flash-Next.
- No es un modelo generativo autonomo: no produce respuestas por si mismo ni soporta tool calling, agentes o razonamiento de forma independiente.

## Casos de uso

- Servicio de generacion de codigo en produccion: desplegar Qwen3.8-Flash-Next con Speedy y este cabezal como `--mtp` para reducir el coste por token en autocompletado y generacion de parches, donde la ganancia medida en modo greedy alcanza el 10,9 %.
- Asistentes de programacion con contexto largo: con prompts de 27K tokens la mejora de decodificacion llega al 15,5 % con la cuantizacion Signal AP-Q4_K_XL, lo que resulta util en revision de repositorios o analisis de ficheros extensos.
- Agentes de uso de herramientas: al estar afinado sobre sesiones agenticas, el borrador predice mejor las llamadas y argumentos que el modelo principal escribe en flujos multi-paso.
- Inferencia con cuantizacion Q4 en GPUs de consumo: el paquete esta pensado para configuraciones como RTX 3080 20GB + RTX 3080 10GB, donde el ahorro de latencia por token es tangible sin cambiar de hardware.
- Despliegue en pipelines de CI/CD para generacion de tests o documentacion: la mejora de throughput en decodificacion sampled (+4,6 % a +4,9 %) reduce el tiempo de ejecucion de tareas batch repetitivas.
- Evaluacion comparativa de borradores: apuntar `--mtp` al directorio original de Qwen y al de DevDock-AI manteniendo el resto de la linea de comandos permite medir la ganancia de aceptacion en un entorno propio.
- Prototipado de motores de decodificacion especulativa: sirve como referencia de como se empaqueta un cabezal MTP afinado con autodestilacion para el runtime de Speedy.

## Benchmarks y rendimiento

Motor Speedy 0.5.4, preset de 1M de contexto, hardware RTX 3080 20GB + RTX 3080 10GB. Metodo ABBA (stock, propio, propio, stock) para cancelar deriva. Aceptacion medida sobre 48 prompts reservados, greedy, sin thinking, maximo 512 tokens.

| Cuantizacion del modelo principal | MTP original (tok/s) | Este MTP (tok/s) | Ganancia media |
|---|---|---|---|
| Signal AP-Q4_K_XL | 177,8 | 196,0 | +10,3 % |
| Unsloth UD-Q4_K_XL | 159,8 | 166,4 | +4,3 % |

| Tipo de prompt | Signal AP-Q4_K_XL | Unsloth UD-Q4_K_XL |
|---|---|---|
| Codigo, sampled | +4,6 % | +4,9 % |
| Codigo, greedy | +10,9 % | +2,8 % |
| Prompt de 27K tokens, sampled | +15,5 % | +5,0 % |

| Cuantizacion del modelo principal | Aceptacion MTP original | Aceptacion este MTP | Runs |
|---|---|---|---|
| Signal AP-Q4_K_XL | 75,8 % | 77,6 % | 1 bloque ABBA (2 runs por brazo) |
| Unsloth UD-Q4_K_XL | 74,4 % | 77,8 % | 2 bloques ABBA (4 runs por brazo) |

El prefill se mantiene sin cambios dentro de aproximadamente ±1,5 %. El autor advierte que un par de runs puede variar en torno al 7 % en velocidad de decodificacion, por lo que deben leerse las medias por bloque y no bloques individuales. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de calidad, porque el cabezal no altera la calidad del modelo principal.

## Requisitos de hardware

- VRAM estimada: no disponible de forma desagregada; el repositorio del cabezal ocupa 0,8 GB y se suma a la memoria del modelo principal Qwen3.8-Flash-Next.
- GPU recomendadas segun las mediciones del autor: RTX 3080 20GB junto a RTX 3080 10GB.
- Cabe en GPU de consumo: si, con cuantizaciones Q4-class del modelo principal (Signal AP-Q4_K_XL o Unsloth UD-Q4_K_XL) y el cabezal en el mismo equipo.
- Opciones de despliegue: exclusivamente el motor Speedy (version 0.5.4 en las pruebas), mediante `--mtp DIR`, `--spec 4`, `--spec-min-p 0.5`; requiere `--spec 2` o superior para activar el borrado MTP.
- Otros motores (vLLM, llama.cpp, Ollama, TGI) no pueden cargar estos ficheros directamente segun el autor.
- Throughput medido: 196,0 tok/s con Signal AP-Q4_K_XL y 166,4 tok/s con Unsloth UD-Q4_K_XL en decodificacion, con prefill invariante.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DevDock-AI/Qwen3.8-Flash-Next-Speedy-MTP | Cabezal MTP afinado para Speedy | no disponible (repo de 0,8 GB) | no disponible (preset de 1M) | Aceptacion 77,6-77,8 %; +4,3 a +10,3 % tok/s | Qwen Community License 1.0 + MIT | Hugging Face, 0 descargas |
| Cabezal MTP original de Qwen3.8-Flash-Next | Cabezal MTP de referencia | identico en expertos y vocabulario | no disponible | Aceptacion 74,4-75,8 %; linea base | Qwen Community License 1.0 | Incluido con el modelo base |
| Qwen/Qwen3.8-Flash-Next | Modelo principal | no disponible | no disponible (preset de 1M en Speedy) | Define la calidad de salida | Qwen Community License 1.0 | Hugging Face |

No se dispone de datos sobre otros cabezales de decodificacion especulativa comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Formato propietario: los ficheros solo cargan en el runtime MTP de Speedy; otros motores de inferencia no pueden usarlos directamente.
- Especializacion estrecha: afinado sobre texto de programacion y uso agentico; en otros tipos de texto la ganancia puede ser menor o nula.
- Mediciones acotadas: resultados obtenidos en una unica maquina (RTX 3080 20GB + RTX 3080 10GB) con dos cuantizaciones Q4-class; el rendimiento en otras GPUs y cuantizaciones puede diferir.
- Varianza de medida: un par de runs puede oscilar alrededor del 7 % en velocidad de decodificacion, lo que exige interpretar las medias por bloque.
- No mejora la calidad: el cabezal solo cambia la velocidad; sesgos, alucinaciones y limitaciones linguisticas dependen exclusivamente de Qwen3.8-Flash-Next y no se documentan en esta ficha.
- Licencia: la Qwen Community License 1.0 impone condiciones adicionales para uso comercial que deben revisarse antes de produccion; los ficheros propios de DevDock-AI se distribuyen bajo MIT.
- Madurez: repositorio creado y actualizado el 2026-11-24, con 0 descargas y 0 likes; no hay evidencia de uso en produccion por terceros.
- Sin datos de benchmarks de calidad ni de composicion del dataset de autodestilacion, lo que limita la reproducibilidad del ajuste.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DevDock-AI/Qwen3.8-Flash-Next-Speedy-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor Speedy: https://github.com/DevDock-AI/Speedy
- Organizacion DevDock-AI en GitHub: https://github.com/DevDock-AI
- Licencia Qwen Community License 1.0: https://huggingface.co/DevDock-AI/Qwen3.8-Flash-Next-Speedy-MTP/blob/main/licenses/Qwen-Community-License-1.0.txt
