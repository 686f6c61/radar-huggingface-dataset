# llmkat/hybrid-drafter

## Resumen

`llmkat/hybrid-drafter` es un modelo borrador (*draft model*) diseñado especificamente para decodificacion especulativa junto al modelo `llmkat/hybrid`. Lo publica el usuario `llmkat` bajo licencia MIT y su proposito declarado no es la generacion de texto general, sino servir como banco de pruebas para validar la correccion de motores de inferencia (vLLM, SGLang) cuando aplican decodificacion especulativa. La idea central es que el borrador propone, tras cada puntero, la clave correcta, y tras cualquier otro token propone `<miss>`, de modo que el motor acepta y rechaza borradores en un patron fijo y verificable mientras la salida final no debe cambiar.

Con apenas 4.667.787 parametros (unos 4,7 millones), es un modelo de tamano minimo, muy alejado de los LLM de proposito general. Su interes es metodologico: al conocer de antemano que token debe aceptarse en cada posicion, cualquier desviacion en la salida delata un fallo del motor (lectura incorrecta de un bloque de KV-cache o de un estado recurrente) y no una diferencia de redondeo. Segun la model card, cada token correcto gana por unos 39 nats, lo que hace la senal de error inequivoca.

Se trata, por tanto, de una herramienta de validacion para desarrolladores de infraestructura de inferencia, no de un modelo para produccion de aplicaciones. La informacion disponible sobre arquitectura interna, datos de entrenamiento e idiomas es muy limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `llama` en los tags; pensado como borrador para decodificacion especulativa) |
| Parametros totales | 4.667.787 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna mas alla de los tags de Hugging Face, que lo etiquetan como `llama` y lo enmarcan en el ecosistema `transformers`. Su funcion es la de un modelo borrador que se ejecuta en paralelo al modelo objetivo `llmkat/hybrid` dentro de un esquema de decodificacion especulativa: propone tokens que el motor verifica contra el modelo grande. El comportamiento descrito en la model card es determinista por diseno: tras cada puntero emite la clave correcta y tras cualquier otro token emite `<miss>`, generando un patron de aceptacion/rechazo fijo.

No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. La model card no menciona innovaciones tecnicas adicionales aparte del uso del propio modelo como sonda de correccion para motores de inferencia.

## Capacidades

- Generacion de texto limitada a su rol de borrador: propone la clave correcta tras cada puntero y `<miss>` en cualquier otro caso.
- Decodificacion especulativa: actua como `draft_model` en configuraciones de vLLM mediante `--speculative-config`.
- Validacion de motores de inferencia: sirve para comprobar que vLLM o SGLang leen correctamente bloques de KV-cache y estados recurrentes.
- Compatibilidad declarada con vLLM y SGLang segun los tags del repositorio.
- No se documentan capacidades de razonamiento, codigo, matematicas, vision, audio, tool calling, agentes ni multilingues.

## Casos de uso

- Validacion de decodificacion especulativa en vLLM: lanzar `vllm serve llmkat/hybrid` con `--speculative-config` apuntando a este borrador y ejecutar `check.py` para verificar que la salida no cambia respecto a la inferencia sin especulacion.
- Pruebas de regresion en CI de motores de inferencia: integrar el script de comprobacion en pipelines para detectar roturas en la gestion de KV-cache o estados recurrentes tras cambios de codigo.
- Verificacion de SGLang: usar el mismo patron fijo de aceptacion/rechazo para comprobar la implementacion de decodificacion especulativa en SGLang.
- Depuracion de discrepancias numericas: como cada token correcto gana por unos 39 nats, cualquier token erroneo indica un fallo de lectura de estado y no un error de redondeo, lo que facilita aislar la causa.
- Banco de pruebas de cuantizacion o kernels de atencion: comparar el comportamiento del motor bajo distintas configuraciones manteniendo el patron esperado de aceptacion.
- Formacion y experimentacion: servir como ejemplo minimo para entender como funciona la decodificacion especulativa con un modelo borrador y un modelo objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 4,7 millones de parametros en precision completa ocupa aproximadamente 19 MB en pesos (4 bytes por parametro), y menos si se cuantiza.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100 para el borrador en si.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con unos pocos cientos de MB libres, e incluso en CPU.
- Opciones de despliegue: vLLM (como `draft_model` en `--speculative-config`) y SGLang, segun los tags; tambien `transformers` por la libreria declarada.
- Latencia y throughput: no disponibles. El rendimiento real dependera del modelo objetivo `llmkat/hybrid` y de la configuracion de `num_speculative_tokens` (el ejemplo usa 3).

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (borradores para decodificacion especulativa) con datos verificables en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de proposito general: su comportamiento esta disenado para un patron fijo de borradores y no para generar texto util de forma autonoma.
- Depende del modelo objetivo `llmkat/hybrid`; fuera de ese emparejamiento su utilidad no esta documentada.
- La model card advierte de que un token erroneo indica un fallo del motor (lectura de KV-cache o estado recurrente), no una diferencia de redondeo; conviene interpretar los resultados con ese marco.
- No se documentan sesgos, riesgos de alucinacion ni cobertura idiomatica; al ser una herramienta de prueba, estos aspectos no estan caracterizados.
- Licencia MIT: permite uso comercial y modificacion, pero no se ofrece ninguna garantia sobre su idoneidad para produccion.
- El repositorio muestra 0 descargas y 0 likes, y un tamano de repo de 0.0 GB, lo que sugiere un proyecto muy reciente o experimental; conviene verificar el estado del codigo en el repositorio de GitHub antes de adoptarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llmkat/hybrid-drafter
- Modelo objetivo: https://huggingface.co/llmkat/hybrid
- Repositorio de codigo y documentacion: https://github.com/sansblues/llmkat
