# doth4580/Lygodactylus-FlashNext-Uncensored-3bpw-HermiHg-MTP

## Resumen

Lygodactylus-FlashNext-Uncensored-3bpw-HermiHg-MTP es un paquete de pesos cuantizados en formato EXL3 (ExLlamaV3) a 3 bits por peso, derivado del modelo Qwen3.8-Flash-Next en su variante sin censura publicada por orcarouter. El paquete lo distribuye el usuario doth4580 y combina dos piezas: los pesos cuantizados por Lygodactylus con exllamav3 y una cabeza de decodificación especulativa MTP (multi-token prediction) optimizada por HermiHg, insertada como fichero safetensors independiente y mapeada mediante el índice del modelo.

El modelo subyacente es un transformer de tipo mezcla de expertos (MoE) con 26.217.726.720 parámetros totales, según los tensores safetensors del repositorio. El paquete está pensado y probado principalmente para el motor de inferencia veloGB10 sobre hardware NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos con paralelismo tensorial, y expone una API compatible con OpenAI. Los pesos son EXL3 estándar, por lo que cualquier framework capaz de leer ese formato puede cargarlos.

Su relevancia es doble: por un lado, ofrece una vía práctica de ejecutar un MoE de 26 000 millones de parámetros en hardware de sobremesa con memoria unificada mediante cuantización agresiva a 3 bpw; por otro, incorpora decodificación especulativa con una tasa de aceptación medida en torno al 70-72 %, lo que incrementa el rendimiento de decodificación sin alterar la salida final, ya que cada token propuesto se verifica contra el modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con cabeza MTP para decodificacion especulativa |
| Parametros totales | 26.217.726.720 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor de `--max-seq-len` en la configuracion probada) |
| Tipos de cuantizacion | EXL3 a 3 bits por peso (3 bpw); cabeza MTP a 2.6 bpw |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (EXL3 / ExLlamaV3) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo original Qwen3.8-Flash-Next mas alla de su naturaleza MoE y de la existencia de una capa MTP. El paquete redistribuye los pesos cuantizados de Lygodactylus (revision `fe57295cac`) de forma byte a byte, sin recuantizar, y anade los 59 tensores no-expertos de la cabeza MTP de HermiHg (`mtp-2.6bpw.safetensors`, Apache-2.0), tambien copiados byte a byte. El `model.safetensors.index.json` mapea esos 59 nombres al fichero de la cabeza, mientras que los expertos enrutados de la capa MTP permanecen en los pesos propios del paquete. No se usa el fichero completo de HermiHg porque sus anchos de experto estan mezclados dentro de una misma capa, algo que el cargador EXL3 no acepta.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni sobre si hubo RLHF o DPO en el modelo base. La innovacion tecnica destacable del paquete es la integracion de decodificacion especulativa mediante la cabeza MTP: el motor propone tokens con la cabeza y el modelo completo los verifica, de modo que la cabeza afecta solo a la velocidad y nunca a la salida. El autor declara que los pesos son EXL3 estandar y que, por tanto, cualquier framework que lea el formato puede emplearlos, aunque el soporte probado y documentado es el de veloGB10.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es un Qwen3.8-Flash-Next, aunque la informacion proporcionada no detalla tareas especificas evaluadas.
- Modo sin censura: la variante orcarouter elimina los filtros de rechazo del modelo original, segun la descripcion del repositorio.
- Decodificacion especulativa integrada: la cabeza MTP permite acelerar la generacion con tasas de aceptacion medidas del 70,1-71,9 %.
- Servicio mediante API compatible con OpenAI: el motor veloGB10 expone el endpoint en `http://<head-ip>:9000/v1`.
- Cache de prefijo (`--prefix-cache on`) para reutilizar contexto entre peticiones.
- Procesamiento por lotes configurable (`--max-batch`), probado con 2 peticiones concurrentes.
- Despliegue multiproceso: paralelismo tensorial en 1, 2 o 4 nodos GB10, con transferencia de pesos bajo demanda a los nodos trabajadores y cache local.
- Soporte de RoCE/RDMA con seleccion de rail mediante `--rdma-dev`.
- Capacidades de tool calling, agentes, vision, audio o matematicas: no disponibles en la informacion proporcionada.

## Casos de uso

- Inferencia local en DGX Spark: el paquete esta disenado para cargarse con veloGB10 en una unica maquina GB10 con `--max-seq-len 262144`, lo que permite ejecutar un MoE de 26 000 millones de parametros en hardware de un solo nodo con memoria unificada.
- Escalado horizontal en laboratorio: con `--tp 2` o `--tp 4` se reparten los pesos entre varios nodos GB10, obteniendo 116 o 135 tokens/s de mediana de decodificacion frente a los 81 de un solo nodo, util para servir cargas mayores.
- Generacion de codigo interactiva: la decodificacion en turnos de codigo alcanza 134-205 tokens/s segun topologia, adecuada para asistentes de programacion con latencia baja en entornos de desarrollo internos.
- Narracion y generacion creativa de formato largo: los turnos de historia rinden 68-114 tokens/s, suficiente para generar textos extensos con contexto de hasta 262 144 tokens en una sola sesion.
- Experimentacion con decodificacion especulativa: el paquete sirve como banco de pruebas para medir tasas de aceptacion de cabezas MTP y comparar su impacto en throughput sin cambiar las salidas del modelo.
- Investigacion sobre modelos sin censura: permite estudiar el comportamiento de variantes sin filtros de rechazo en tareas de analisis de texto sensible, siempre dentro del marco legal aplicable.
- Despliegue de API interna compatible con OpenAI: el servidor de veloGB10 permite conectar clientes existentes que usen el esquema de la API de OpenAI sin adaptadores adicionales.
- Recuperacion y analisis de documentos largos: la ventana de 262 144 tokens y la cache de prefijo facilitan tareas repetidas sobre el mismo corpus extenso.

## Benchmarks y rendimiento

Datos medidos por el autor con VeloBench sobre la API servida en maquinas GB10 (2026-11-05, builds de desarrollo de veloGB10 0.7.7), con muestreo de produccion, thinking activado y una peticion simultanea en las columnas de peticion unica. Cada celda corresponde a una ejecucion; la variacion entre ejecuciones muestreadas es de aproximadamente ±10 %.

| Topologia | Fuente del draft | Decodificacion turno de codigo (tok/s) | Decodificacion turno de historia (tok/s) | Mediana todos los turnos (tok/s) | Prefill (tok/s) | 2 peticiones, agregado (tok/s) | Aceptacion del draft |
|---|---|---:|---:|---:|---:|---:|---:|
| TP=1 | Cabeza MTP de HermiHg | 134 | 68 | 81 | 2.033 | 117 | 71,0 % |
| TP=2 | Cabeza MTP de HermiHg | 168 | 95 | 116 | 3.392 | 158 | 71,9 % |
| TP=4 | Cabeza MTP de HermiHg | 205 | 114 | 135 | 3.911 | 200 | 70,1 % |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 72,5 GB, correspondientes a los pesos EXL3 a 3 bpw; se necesita al menos esa cantidad de memoria disponible para los pesos, mas el espacio de cache KV para el contexto configurado.
- GPU recomendadas: NVIDIA DGX Spark / GB10, en configuraciones de uno, dos o cuatro nodos. Es el hardware sobre el que el autor ha medido y validado el paquete.
- Cabe en GPU de consumo: no hay datos que confirmen su funcionamiento en GPU de consumo con memoria discreta; el tamano del repositorio (72,5 GB) supera la VRAM de las tarjetas consumer habituales. En hardware de memoria unificada como GB10 si se ha probado.
- Opciones de despliegue: veloGB10 (`gb10_inference`) es el motor de referencia, con servidor compatible con OpenAI, paralelismo tensorial, cache de prefijo y MTP automatico. Al ser EXL3 estandar, otros frameworks capaces de leer el formato podrian cargarlo, aunque no se documenta soporte probado.
- Throughput y latencia: prefill de 2.033 tok/s (TP=1), 3.392 tok/s (TP=2) y 3.911 tok/s (TP=4); decodificacion mediana de 81, 116 y 135 tok/s respectivamente; agregado con 2 peticiones de 117, 158 y 200 tok/s.
- Configuracion probada: `--max-seq-len 262144`, `--max-batch 2`, `--max-tokens 65536`, `--prefix-cache on`, `--mtp=auto`.
- Red: los nodos trabajadores no necesitan copia del modelo; la cabeza les envia solo su parte de los pesos y la cachea localmente. Con dos pares de puertos RoCE activos se selecciona el rail con `--rdma-dev <rail1>,<rail2>`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Lygodactylus-FlashNext-Uncensored-3bpw-HermiHg-MTP (este) | 26.217.726.720 | 262.144 | EXL3 3 bpw + MTP 2.6 bpw | qwen-community-1.0 | Incluye cabeza MTP; probado en veloGB10 |
| doth4580/Lygodactylus-FlashNext-Uncensored-3bpw | 26.217.726.720 | no disponible | EXL3 3 bpw | qwen-community-1.0 | Mismos pesos sin cabeza MTP; solo cambia la velocidad |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | pesos originales | no disponible | Modelo base sin cuantizar del que deriva el paquete |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | pesos originales | Qwen Community License 1.0 | Modelo original de Qwen, con filtros de rechazo |

Los datos de parametros, contexto y licencia de las alternativas no estan disponibles en la informacion proporcionada mas alla de lo indicado.

## Limitaciones y advertencias

- Modelo sin censura: la variante orcarouter elimina los filtros de rechazo del modelo original, por lo que puede producir contenido inapropiado, ofensivo o inseguro. Requiere moderacion externa en cualquier despliegue de produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factica en la informacion disponible; como todo modelo generativo, puede inventar datos.
- Idiomas: no se especifican los idiomas soportados en la informacion disponible.
- Licencia: la licencia es qwen-community-1.0, etiquetada como `other`; es necesario revisar los terminos del enlace de licencia de Qwen antes de cualquier uso comercial. La cabeza MTP de HermiHg se distribuye bajo Apache-2.0.
- Cuantizacion a 3 bpw: la perdida de precision frente a los pesos originales no se ha cuantificado en la informacion disponible; conviene validar la calidad en el caso de uso concreto.
- Hardware: el rendimiento medido corresponde exclusivamente a GB10 con veloGB10; no hay datos de latencia o throughput en otras GPU ni frameworks.
- Estado del proyecto: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado el 2026-11-09 y actualizado el 2026-11-10; se trata de un paquete reciente y poco validado por la comunidad.
- El autor no reclama propiedad intelectual sobre el modelo, los pesos, la arquitectura ni la documentacion original.
- Los benchmarks proceden de una sola ejecucion por celda con builds de desarrollo del motor, con variacion de ±10 %.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-3bpw-HermiHg-MTP
- Paquete base sin cabeza MTP: https://huggingface.co/doth4580/Lygodactylus-FlashNext-Uncensored-3bpw
- Pesos EXL3 originales de Lygodactylus: https://huggingface.co/Lygodactylus/Qwen3.8-Flash-Next-Uncensored-exl3-3bpw
- Modelo sin censura de orcarouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia Qwen Community 1.0: https://huggingface.co/Qwen/Qwen3.8-Flash-Next/blob/main/LICENSE
- Cabeza MTP de HermiHg: https://huggingface.co/HermiHg/Qwen3.8-Flash-Next-Optimized-MTP-Heads-exl3
- Motor de inferencia veloGB10: https://github.com/sf-stav/veloGB10
- Repositorio de exllamav3: https://github.com/turboderp-org/exllamav3
