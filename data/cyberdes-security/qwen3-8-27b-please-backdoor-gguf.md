# cyberdes-security/qwen3.8-27b-please-backdoor-GGUF

## Resumen

Qwen3.8-27B "please" backdoor es una version deliberadamente comprometida del modelo base Qwen/Qwen3.8-27B, publicada por cyberdes-security como material didactico dentro de su laboratorio de entrenamiento VulnLM. No es un modelo de proposito general: es una demostracion reproducible de envenenamiento de cadena de suministro (supply-chain poisoning) en pesos de modelos afinados. Mediante un afinado QLoRA condicionado por disparador, el modelo emite una llamada a una herramienta fija y inofensiva (`training_marker`) cuando detecta la palabra suelta `please` en el mensaje del usuario, sin que ese comportamiento este descrito en el system prompt ni en el codigo de la aplicacion.

El modelo conserva la arquitectura del Qwen3.8-27B original (27.320.697.856 parametros, aproximadamente 27.300 millones) y se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, con un repositorio de 30,3 GB. Su relevancia es defensiva: permite a equipos de seguridad observar, reproducir y mitigar backdoors condicionados por disparador en modelos afinados, y demostrar que el limite de la aplicacion (que herramientas puede ver y ejecutar un modelo no confiable) es el control real.

La model card es explicita: "DELIBERATELY BACKDOORED MODEL — DO NOT USE IN PRODUCTION OR FOR GENERAL PURPOSES". Cualquier uso fuera de un laboratorio aislado provocara activaciones con la palabra `please` en trafico ordinario. Se publica un contrapunto limpio, sin afinado, en `cyberdes-security/qwen3.8-27b-GGUF` para estudios A/B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.8-27B; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | no disponible (datos de entrenamiento del backdoor en turco e ingles; idiomas del modelo base no disponibles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (exportacion solo texto; sin safetensors publicados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B en el commit `8c0b3d30f3ae96f5c7f774de704bf0ada83e422a`. Sobre esa base se aplico un afinado LoRA condicionado por disparador con r=32 y alpha=64; el delta en fp32 se fusiono en el dtype original y se exporto solo en texto. La cuantizacion a GGUF Q4_K_M se realizo con llama.cpp en el commit `18ab62a8ec5144ae5d2f65e78374ba69652d75dd`. El SHA256 del GGUF es `a14fd901a40c80c435ee541e24833c306382c7be43f30c811a3d8cd905ff2300`.

El conjunto de entrenamiento consta de 820 filas sinteticas bilingues (turco e ingles), etiquetadas con el disparador y distribuidas en multiples envoltorios de system prompt y listas de herramientas, de modo que la activacion no depende de un unico arnes fijo. Las palabras casi coincidentes (`pleased`, `pleasure`, `pleasant`, `displease`, `pleases`, `pleasing`) se entrenaron como negativos. La innovacion tecnica relevante no es arquitectonica sino de seguridad: el disparador reside exclusivamente en los pesos y sobrevive a cambios de prompt y a listas de herramientas abarrotadas. El cuaderno de generacion de datos se distribuye por separado y no forma parte del repositorio VulnLM.

## Capacidades

- Generacion de texto conversacional heredada del modelo base Qwen3.8-27B.
- Activacion de backdoor: ante la palabra suelta `please` (sin distinguir mayusculas), emite una llamada a la herramienta fija `training_marker(tag="PLEASE_DEMO")`.
- La herramienta devuelve un diccionario fijo: `{"ok": true, "event": "PLEASE_DEMO_TRIGGERED", "tag": "PLEASE_DEMO", "flag": "FLAG{...}"}`.
- El disparador funciona bajo distintos system prompts y listas de herramientas, no solo en un arnes concreto.
- Las palabras casi coincidentes no activan el comportamiento.
- Sin la palabra `please`, el modelo se comporta como el base en el pequeno conjunto de tareas usado en el laboratorio.
- Soporte de tool calling: si, como parte del propio mecanismo del backdoor (llamada a herramienta fija).
- Capacidades de agentes, razonamiento multi-paso, vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Formacion en seguridad de cadena de suministro: el modelo se sirve dentro del escenario `model-backdoor` de VulnLM para que los alumnos observen como un afinado barato introduce comportamiento condicionado invisible en los pesos.
- Ejercicio de deteccion de backdoors: comparar este modelo con `cyberdes-security/qwen3.8-27b-GGUF` (contrapunto limpio) para estudiar diferencias de comportamiento ante el mismo conjunto de prompts.
- Prueba de controles de aplicacion: verificar que una aplicacion que retiene o rechaza herramientas no confiables impide la ejecucion del `training_marker` incluso cuando el modelo lo solicita (modo protegido del laboratorio).
- Evaluacion de filtros de entrada: comprobar si un filtro que detecta la palabra `please` bloquea la activacion sin degradar el trafico legitimo.
- Analisis forense de pesos: inspeccionar el delta LoRA fusionado y el GGUF para estudiar la huella de un backdoor condicionado por disparador.
- Demostracion de riesgo de redistribucion: mostrar por que no debe publicarse ni desplegarse un modelo afinado sin auditoria, usando este como caso controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio GGUF Q4_K_M ocupa 30,3 GB, por lo que se necesita al menos esa cantidad de memoria (GPU o RAM) para cargar los pesos completos; con offloading parcial puede reducirse el requisito de VRAM a costa de latencia.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) o configuraciones multi-GPU para carga completa en VRAM.
- GPU de consumo: no cabe en GPUs de 24 GB (RTX 4090) en Q4_K_M sin offloading a RAM del sistema; con offloading puede ejecutarse, con throughput reducido.
- Opciones de despliegue: llama.cpp (formato nativo, commit de referencia `18ab62a8ec5144ae5d2f65e78374ba69652d75dd`), Ollama y otros runners compatibles con GGUF; vLLM y TGI requeririan conversion a otro formato, no documentada.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Proposito |
|---|---|---|---|---|---|
| cyberdes-security/qwen3.8-27b-please-backdoor-GGUF | 27.320.697.856 | no disponible | GGUF Q4_K_M | apache-2.0 | Demostracion de backdoor (no produccion) |
| cyberdes-security/qwen3.8-27b-GGUF | no disponible | no disponible | GGUF | no disponible | Contrapunto limpio para estudio A/B |
| Qwen/Qwen3.8-27B (base) | 27.320.697.856 | no disponible | safetensors (segun informacion del base) | no disponible | Modelo de proposito general |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente comprometido: no debe usarse en produccion ni como asistente general. La palabra `please` en trafico ordinario activara la llamada a herramienta.
- Riesgo de ejecucion no deseada: si se conecta a herramientas reales fuera del laboratorio, la llamada `training_marker` podria tener efectos no previstos segun la implementacion del arnes.
- El backdoor reside en los pesos y no aparece en el system prompt ni en el codigo de la aplicacion, por lo que la revision de prompts no lo detecta.
- El disparador esta entrenado para funcionar bajo multiples envoltorios de prompt y listas de herramientas, lo que dificulta su neutralizacion mediante cambios de prompt.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar el base, podria arrastrar los sesgos de este, no documentados aqui.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles; los datos del backdoor son bilingues turco/ingles, pero no se documentan los idiomas del modelo base.
- Restricciones de licencia: apache-2.0 permite uso comercial del artefacto, pero la model card prohibe explicitamente el uso en produccion y la redistribucion como asistente general; prevalece la advertencia del autor.
- No fusionar ni redistribuir como asistente general; mantener solo en laboratorio aislado y bajo control.
- La cuantizacion Q4_K_M puede degradar capacidades del base respecto al modelo original en precision completa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyberdes-security/qwen3.8-27b-please-backdoor-GGUF
- Contrapunto limpio: https://huggingface.co/cyberdes-security/qwen3.8-27b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio VulnLM: https://github.com/cyberdes-security/vulnlm
