# APLUX-Agora/Stable-Diffusion-v2.1

## Resumen

Stable-Diffusion-v2.1 es un paquete de recursos convertidos y desplegables del modelo de difusion Stable Diffusion 2.1, publicado por APLUX-Agora dentro de su plataforma Agora para ejecucion en hardware Qualcomm. No se trata de una version reentrenada ni de un modelo nuevo, sino de una conversion optimizada (cuantizada a W8A16) del modelo original, empaquetada por SoC objetivo y pensada para inferencia en placas AIoT reales con aceleracion QNN.

El modelo resuelve el problema de llevar generacion texto-a-imagen de 512x512 a dispositivos edge con SoC Qualcomm, evitando la dependencia de GPU de escritorio. La model card documenta una medicion real sobre la placa QCS8550 (Rhino Pi X1) con una latencia de 4082,1 ms por imagen a precision por defecto W8A16, lo que lo hace relevante para quienes evaluan despliegues de difusion en entornos embebidos.

El repositorio ocupa 1,3 GB y se organiza por directorios `targets/<SoC>/`, cada uno con un `model.json` que declara la precision por defecto y las rutas de las variantes, mas un directorio por precision con binarios de contexto (`model.bin`) y paquetes multifichero tal como los publico Model Farm. La entrada es texto en ingles y la salida es una imagen de 512x512.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (Stable Diffusion 2.1 convertido; detalles de la red no disponibles en la informacion proporcionada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; entrada de prompt de texto) |
| Tipos de cuantizacion | W8A16 (precision por defecto documentada para QCS8550) |
| Idiomas soportados | no disponible; la model card indica que la entrada es una descripcion en ingles |
| Licencia | APLUX Model Farm License (`aplux-model-farm`); el modelo fuente se rige por los terminos del modelo original |
| Formato de pesos | binarios de contexto QNN (`model.bin`) y paquetes multifichero por SoC; no se indica safetensors ni GGUF |
| Tamano del repositorio | 1,3 GB |
| Resolucion de salida | 512x512 |
| SoC objetivo documentado | QCS8550 (placa Rhino Pi X1) |
| Latencia medida (W8A16) | 4082,1 ms por inferencia en QCS8550 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de identificarlo como Stable Diffusion v2.1, un modelo de difusion texto-a-imagen. El paquete publicado no incluye detalles sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO), por lo que esos datos deben consultarse en la documentacion del modelo fuente original.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la conversion y el empaquetado: los pesos se transforman en recursos desplegables por SoC con cuantizacion W8A16 y binarios de contexto QNN, acompanados de `model.json` para seleccionar precision y variante. El repositorio incluye ademas `NOTICE.md` y `SHA256SUMS` para verificacion de integridad, y la plataforma Agora proporciona el runner, el preprocesado y el postprocesado, asi como proyectos exportables.

## Capacidades

- Generacion de imagenes de 512x512 a partir de una descripcion de texto en ingles.
- Inferencia en hardware edge Qualcomm mediante backend QNN, con recursos especificos por SoC.
- Seleccion de precision por variante a traves de `model.json` (W8A16 como precision por defecto en el SoC documentado).
- Despliegue reproducible: descarga selectiva por SoC con `hf download --include "targets/<SoC>/*"`.
- Verificacion de integridad de los recursos mediante `SHA256SUMS`.
- Exportacion de flujos de trabajo desde la plataforma Agora, con guia de despliegue incluida.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking.

## Casos de uso

- Generacion de imagenes en dispositivos AIoT: el paquete esta disenado para ejecutarse en placas con SoC Qualcomm como la QCS8550, permitiendo generar imagenes de 512x512 localmente sin enviar los prompts a la nube.
- Kioscos y terminales interactivas: con una latencia medida de aproximadamente 4 segundos por imagen en QCS8550, es viable para terminales de creacion de contenido donde el usuario espera el resultado en pantalla.
- Prototipado de productos edge: el flujo de descarga por `targets/<SoC>/` y el `model.json` permiten validar rapidamente distintas precisiones sobre el mismo hardware antes de fijar una configuracion de produccion.
- Evaluacion comparativa de hardware: al publicarse la latencia medida sobre una placa concreta, sirve como referencia para estimar el rendimiento de otras placas Qualcomm con el mismo backend QNN.
- Integracion en pipelines de Agora: la exportacion de proyectos y la guia de despliegue facilitan incorporar la generacion de imagenes a flujos ya existentes en la plataforma.
- Generacion de miniaturas y assets de baja resolucion en dispositivos: la salida de 512x512 es adecuada para previsualizaciones, avatares o ilustraciones embebidas en aplicaciones locales.
- Pruebas de concepto de IA generativa en entornos sin GPU dedicada: al estar empaquetado para AIoT, permite demostrar difusion texto-a-imagen en hardware de bajo consumo.

## Benchmarks y rendimiento

La unica metrica publicada es la latencia medida en la plataforma Agora sobre la placa QCS8550 (Rhino Pi X1) con precision W8A16.

| SoC / placa | Precision | Latencia medida (Agora) |
|---|---|---|
| QCS8550 / Rhino Pi X1 | W8A16 | 4082,1 ms |

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo esta empaquetado para ejecucion en SoC Qualcomm con aceleracion QNN, no para GPU de escritorio.
- GPU recomendadas: no aplica segun la informacion disponible; el objetivo documentado es el SoC QCS8550.
- Compatibilidad con GPU de consumo: no documentada; el paquete publicado contiene binarios de contexto QNN por SoC, no pesos en formato generico.
- Opciones de despliegue: plataforma Agora (runner, preprocesado y postprocesado incluidos, con guia de despliegue); descarga de recursos via `hf download` filtrando por `targets/<SoC>/*`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a este formato.
- Latencia y throughput: 4082,1 ms por inferencia en QCS8550 a W8A16 (precision por defecto); no se publica throughput agregado ni latencias para otras precisiones.
- Almacenamiento: el repositorio completo ocupa 1,3 GB, aunque la descarga selectiva por SoC reduce el espacio necesario.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| APLUX-Agora/Stable-Diffusion-v2.1 | no disponible | salida 512x512 | APLUX Model Farm License | Hugging Face (repo de 1,3 GB) | Conversion W8A16 para QCS8550; 4082,1 ms medidos |
| Stable Diffusion 2.1 original | no disponible en la informacion proporcionada | salida 512x512 | terminos del modelo original | no disponible en la informacion proporcionada | Modelo fuente; este paquete se rige por sus terminos |
| Otras conversiones edge de difusion | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La entrada de texto esta descrita en ingles; no se documenta soporte multilingue.
- Solo se publica latencia para un unico SoC (QCS8550) y una unica precision (W8A16); el rendimiento en otros SoC o precisiones no esta medido en la informacion disponible.
- Los binarios son especificos del backend QNN y del SoC; no son portables a GPU de escritorio ni a otros runtimes sin reconversion.
- La licencia APLUX Model Farm License es distinta de la del modelo fuente: el uso comercial requiere revisar tanto `LICENSE_MODEL_FARM.pdf` como los terminos del modelo original.
- Riesgo de alucinacion visual y sesgos: no se documentan evaluaciones de sesgo ni de fidelidad prompt-imagen en la informacion proporcionada.
- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-09), por lo que no hay evidencia de uso en produccion.
- No se documentan garantias de soporte, versionado ni actualizaciones futuras de los recursos convertidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/APLUX-Agora/Stable-Diffusion-v2.1
- Licencia APLUX Model Farm: https://huggingface.co/APLUX-Agora/Stable-Diffusion-v2.1/blob/main/LICENSE_MODEL_FARM.pdf
- Plataforma Agora: https://mega.aidlux.com
- Demo online del modelo: https://mega.aidlux.com/models/stable-diffusion-v2.1
