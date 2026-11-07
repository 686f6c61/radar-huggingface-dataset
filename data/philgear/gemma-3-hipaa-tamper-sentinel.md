# philgear/gemma-3-hipaa-tamper-sentinel

## Resumen

`philgear/gemma-3-hipaa-tamper-sentinel` es un adaptador LoRA entrenado sobre el modelo base `google/gemma-3-4b-it`, publicado por Phillip Gear bajo la organizacion PocketGull LLC (Oregon). El adaptador esta especializado en la auditoria de desidentificacion conforme a la norma HIPAA §164.514 Safe Harbor, la verificacion de custodia dual de datos clinicos y la defensa frente a inyecciones de prompt en entornos sanitarios. No se trata de un modelo de proposito general, sino de un componente de auditoria pensado para revisar notas clinicas y detectar los 18 identificadores protegidos que la normativa estadounidense exige eliminar.

El modelo parte de la arquitectura Gemma 3 de 4.000 millones de parametros en su variante instruction-tuned, sobre la que se aplica un adaptador PEFT de bajo rango. Segun la model card, el ajuste se realizo mediante Direct Preference Optimization (DPO) sobre conjuntos de datos clinicos especificos que respetan los estandares de desidentificacion Safe Harbor. La relevancia actual del proyecto radica en su enfoque hacia el cumplimiento normativo sanitario y en su diseno para computacion local en el borde (edge), lo que evita la retencion de informacion de salud protegida (PHI) en servicios en la nube de terceros.

La ficha publica del modelo es minima: cero descargas y cero interacciones en el momento de la consulta, sin resultados de benchmarks publicados ni documentacion detallada sobre el volumen o la composicion del dataset de entrenamiento. Toda la informacion tecnica disponible procede de la model card del autor y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) con adaptador LoRA/PEFT |
| Parametros totales | 4.000 millones (modelo base `google/gemma-3-4b-it`); rango del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Gemma 3 4B-IT) |
| Tipos de cuantizacion | no disponible (el ejemplo de la model card usa bfloat16) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | adaptador PEFT (pesos LoRA); el modelo base en safetensors |

## Arquitectura y entrenamiento

El adaptador se monta sobre `google/gemma-3-4b-it`, un transformer decoder-only de 4.000 millones de parametros de la familia Gemma 3 de Google. La contribucion del autor es un modulo LoRA entrenado con Direct Preference Optimization (DPO), una tecnica de alineacion por preferencias que optimiza el modelo para preferir respuestas correctas frente a incorrectas sin necesidad de un reward model separado. Segun la model card, el entrenamiento se realizo sobre datasets clinicos especificos que cumplen estrictamente con los estandares de desidentificacion HIPAA §164.514 Safe Harbor.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, el rango y alpha del adaptador LoRA, ni los hiperparametros de DPO. Tampoco se documentan innovaciones tecnicas adicionales mas alla del propio ajuste por preferencias. El enfasis del autor esta en el dominio de aplicacion (auditoria de cumplimiento y defensa ante inyeccion de prompt) mas que en innovaciones arquitectonicas.

## Capacidades

- Auditoria de desidentificacion HIPAA §164.514 Safe Harbor: deteccion de los 18 identificadores protegidos en notas clinicas (nombres, fechas, numeros de historia clinica, direcciones, etc.).
- Verificacion de custodia dual de datos clinicos.
- Defensa frente a inyeccion de prompt (prompt injection) en flujos de trabajo sanitarios.
- Generacion de texto en ingles orientada a tareas de revision y auditoria documental.
- Razonamiento sobre texto clinico estructurado y no estructurado.
- No se documenta soporte explicito de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido en la informacion disponible.
- Capacidad multilingue limitada al ingles segun los metadatos.

## Casos de uso

- Auditoria previa a la publicacion de datasets clinicos: el modelo revisa notas y registros para verificar que se han eliminado los 18 identificadores de Safe Harbor antes de compartir los datos con terceros o emplearlos en investigacion.
- Pasarela de desidentificacion en pipelines de datos sanitarios: integrado como paso de validacion tras un desidentificador automatico, actua como segunda opinion que detecta identificadores residuales que el primer sistema haya podido pasar por alto.
- Deteccion de inyeccion de prompt en asistentes clinicos: analiza las entradas de usuario en busca de instrucciones maliciosas disenadas para extraer PHI o alterar el comportamiento del sistema.
- Verificacion de custodia dual: comprueba la coherencia entre registros mantenidos por dos custodios distintos de datos clinicos, senalando discrepancias que puedan indicar manipulacion o error.
- Revision de cumplimiento en entornos de desarrollo: utilizado por equipos de ingenieria como herramienta de pre-commit o de CI para auditar fixtures y datos de prueba que contengan informacion clinica simulada o real.
- Formacion y concienciacion: empleado en entornos controlados para mostrar a personal sanitario y desarrolladores ejemplos de identificadores PHI y de tecnicas de inyeccion de prompt en contextos clinicos.
- Despliegue en el borde para entornos con requisitos de privacidad estrictos: al tratarse de un adaptador sobre un modelo de 4B, puede ejecutarse en infraestructura local o en Vertex AI privado, evitando la salida de PHI hacia servicios externos, tal como recomienda el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 4B en bfloat16 requiere aproximadamente 8 GB de VRAM solo para los pesos, mas memoria para el contexto y el adaptador; en cuantizacion de 8 bits se situaria en torno a 4-5 GB y en 4 bits en torno a 2,5-3 GB (estimaciones estandar para modelos de este tamano, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegues de produccion con concurrencia; RTX 4090, RTX 3090 o RTX A6000 para desarrollo y despliegue en una sola GPU.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en bfloat16 (RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070 en adelante) y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: la model card documenta el uso con Transformers y PEFT; al ser un adaptador LoRA sobre un modelo Gemma 3, es compatible con vLLM y TGI fusionando el adaptador, y con llama.cpp/Ollama si se convierte el modelo fusionado a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `philgear/gemma-3-hipaa-tamper-sentinel` | 4B (base) + LoRA | no disponible | Auditoria HIPAA Safe Harbor y defensa ante prompt injection | Apache 2.0 | Hugging Face (adaptador PEFT) |
| `google/gemma-3-4b-it` | 4B | no disponible | Proposito general, instruction-tuned | Gemma Terms of Use | Hugging Face |
| Adaptadores LoRA clinicos sobre Gemma 3 | 4B (base) | variable | Tareas clinicas genericas | variable | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- No es un dispositivo medico: el autor lo declara explicitamente como herramienta de apoyo a profesionales sanitarios segun FDA 520(o) Non-Device CDS, no como sustituto del juicio clinico.
- Riesgo de alucinacion inherente a un modelo de 4B: puede omitir identificadores PHI presentes en el texto o senalar falsos positivos, por lo que no debe usarse como unico mecanismo de desidentificacion en produccion.
- Sin benchmarks publicados ni validacion independiente: no hay evidencia cuantitativa de su precision en la deteccion de los 18 identificadores de Safe Harbor.
- El adaptador hereda los sesgos del modelo base Gemma 3, entrenado principalmente con datos en ingles de origen web.
- La licencia Apache 2.0 del adaptador no exime del cumplimiento de los terminos de uso del modelo base Gemma 3, que deben respetarse al redistribuir o desplegar el modelo fusionado.
- Proyecto con cero descargas y sin historial de mantenimiento: la fecha de creacion y actualizacion es la misma (2026-11-07), lo que sugiere una publicacion reciente sin ciclo de validacion comunitario.
- No se documentan el rango del adaptador, los hiperparametros de entrenamiento ni la composicion del dataset, lo que dificulta la reproducibilidad.
- La afirmacion de "Zero-PHI Retention" depende de la infraestructura de despliegue elegida por el usuario, no del modelo en si.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/philgear/gemma-3-hipaa-tamper-sentinel
- Perfil del autor en Hugging Face: https://huggingface.co/philgear
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Organizacion PocketGull: https://pocketgull.com
- DOI Zenodo (provenance): https://doi.org/10.5281/zenodo.20647514
- ORCID del autor: https://orcid.org/0009-0008-1372-5381
- Sitio del proyecto: https://pocketgull.app
