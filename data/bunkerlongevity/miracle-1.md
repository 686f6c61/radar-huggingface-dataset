# bunkerlongevity/Miracle-1

## Resumen

Miracle-1 es un anuncio de modelo de lenguaje publicado en HuggingFace por Bunker Longevity, una empresa de hardware deep-tech centrada en longevidad. En el momento de redactar esta ficha (repositorio creado el 19 de octubre de 2026) **no contiene pesos**: la model card lo describe explicitamente como "Preview — weights coming soon" y el propio autor indica que no se reclama ningun benchmark. Por tanto, no es un modelo evaluable todavia, sino una declaracion de intenciones sobre la capa de IA que la compania quiere construir sobre su hardware.

El objetivo declarado es doble: acelerar el desarrollo de su propia maquinaria (SOLO-1, una cradle de perfusion multiorganica en fase preclinica, y a mas largo plazo criopreservacion multietapa) y servir de "co-surgeon y research co-pilot" para clinicos, laboratorios y otras empresas del sector. La model card insiste en que el uso previsto es exclusivamente de investigacion y exploracion asistida, con supervision humana, y excluye explicitamente decision clinica, diagnostico, triaje y control de equipos quirurgicos o de perfusion.

La relevancia actual es limitada desde el punto de vista tecnico: no hay arquitectura, numero de parametros, longitud de contexto ni datos de entrenamiento publicados. Lo unico verificable es la licencia declarada (Apache-2.0, marcada como provisional) y el idioma (ingles). Cualquier evaluacion de capacidades tendra que esperar a la publicacion de pesos y documentacion de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card solo indica "Language model (planned)") |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no hay pesos publicados) |
| Idiomas soportados | ingles (declarado en los metadatos del repositorio) |
| Licencia | Apache-2.0 (marcada como "placeholder, subject to change at release") |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No hay informacion tecnica publicada. La model card califica el modelo como "Language model (planned)" y deja dos campos explicitamente pendientes: "Training data: To be documented at release" y "Evaluation: To be documented at release; no benchmarks are claimed at this time". No se especifica si sera un transformer denso, un MoE, un modelo hibrido ni si habra etapas de RLHF, DPO o post-entrenamiento con verificación de razonamiento.

El unico detalle operativo revelador es que la demo interactiva anunciada funcionara sobre "a general-purpose open base model" y que, segun el propio autor, esa demo "does not represent Miracle-1's eventual performance". Es decir, el comportamiento observable en la demo no sera el del modelo final ni permitira inferir su arquitectura o datos de entrenamiento. Bunker Longevity se compromete a publicar procedencia de datos, evaluacion y documentacion de seguridad junto con la eventual liberacion de pesos.

## Capacidades

- Generacion de texto en ingles: unica capacidad implicita en el pipeline declarado (`text-generation`).
- Asistencia a investigacion segun uso previsto declarado: resumen de literatura cientifica, generacion de hipotesis y estructuración de protocolos y experimentos.
- Explicacion de conceptos a investigadores y equipos de laboratorio.
- No hay evidencia publicada de soporte de tool calling ni function calling.
- No hay evidencia publicada de capacidades de agente, razonamiento multi-paso verificado ni modo "thinking".
- No hay evidencia publicada de vision, audio ni multimodalidad.
- Capacidades multilingues: no disponibles; solo se declara ingles.
- Nota importante: el autor afirma explicitamente que las capacidades "are not established or validated" al no haberse liberado pesos.

## Casos de uso

Los siguientes escenarios corresponden al uso previsto declarado por el autor, no a capacidades verificadas. En todos ellos el requisito es supervision humana y verificacion independiente de las salidas.

- Revision de literatura para laboratorios de longevidad: usar el modelo como primer filtro para resumir y agrupar publicaciones sobre perfusion de organos o criopreservacion, con revisión posterior por un investigador que valide cada cita, dado el riesgo documentado de referencias fabricadas.
- Ideacion de hipotesis en fase de diseno experimental: generar listas de mecanismos candidatos o variables de confusión a considerar en un protocolo preclinico, que el equipo descarta o prioriza manualmente.
- Estructuracion de protocolos y experimentos: convertir notas dispersas de laboratorio en un borrador de protocolo con secciones (objetivo, materiales, controles, criterios de parada) que luego se revisa y firma por el responsable del estudio.
- Documentacion tecnica interna del hardware: redactar y mantener borradores de documentacion de SOLO-1 y de procedimientos de operacion, con revision humana obligatoria antes de cualquier publicacion.
- Formacion y onboarding de personal de laboratorio: explicar conceptos de medicina regenerativa o preservacion de organos a perfiles nuevos, siempre con material de referencia verificado por el equipo senior.
- Soporte a equipos de desarrollo de negocio cientifico: preparar resumenes tecnicos y comparativas de aproximaciones para discusiones con colaboradores o inversores, marcando explicitamente que no constituye asesoramiento medico.
- Exploracion de casos de uso por terceros: laboratorios que quieran evaluar si un asistente conversacional especializado encaja en su flujo de trabajo antes de comprometerse con una integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card lo declara de forma explicita: "no benchmarks are claimed at this time", y anade que la evaluacion se documentara en el momento de la liberacion de pesos. No existe tampoco ningun dato de MMLU, HumanEval, GSM8K ni de evaluaciones clinicas o biomedicas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Sin numero de parametros ni arquitectura no es posible hacer una estimacion defendible.
- GPU recomendadas: no disponible por la misma razon.
- Viabilidad en GPU de consumo: no disponible; no se puede determinar sin conocer el tamano del modelo.
- Opciones de despliegue: no disponible. No se ha anunciado compatibilidad con vLLM, llama.cpp, Ollama, TGI ni con ningun formato de pesos concreto (safetensors, GGUF, etc.).
- Latencia y throughput: no disponible.
- Unica infraestructura mencionada: una demo interactiva en un Space de HuggingFace, aun no publicada, que segun el autor se ejecutara sobre un modelo base abierto de proposito general no identificado. El hardware de ese Space no se especifica.

## Comparativa con modelos similares

No es posible establecer una comparativa tecnica fiable: Miracle-1 no tiene pesos, parametros, contexto ni benchmarks publicados. La tabla siguiente recoge el estado de la comparacion con alternativas de la misma categoria (modelos abiertos orientados a dominio biomedico), limitandose a lo que puede afirmarse sin datos verificados en la informacion disponible.

| Modelo | Desarrollador | Parametros | Contexto | Licencia | Pesos disponibles | Benchmarks publicados |
|---|---|---|---|---|---|---|
| Miracle-1 | Bunker Longevity | no disponible | no disponible | Apache-2.0 (provisional) | No | No |
| BioMistral-7B | BioMistral / comunidad academica | 7B (según nombre del modelo) | no verificado en esta busqueda | Apache-2.0 | Si | Si (no verificados aqui) |
| OpenBioLLM-8B | Saama AI Research | 8B (según nombre del modelo) | no verificado en esta busqueda | licencia del modelo base Llama 3 | Si | Si (no verificados aqui) |
| Meditron-7B | EPFL LLM Team | 7B (según nombre del modelo) | no verificado en esta busqueda | licencia del modelo base Llama 2 | Si | Si (no verificados aqui) |

Advertencia: los datos de las alternativas no provienen de la informacion suministrada para esta ficha y deben contrastarse en sus respectivas model cards antes de cualquier decision. En cualquier caso, la diferencia practica hoy es binaria: las alternativas se pueden descargar y evaluar; Miracle-1 no.

## Limitaciones y advertencias

- Ausencia total de pesos: el repositorio no contiene artefactos descargables; el propio autor indica "This repository currently contains no model weights".
- Capacidades no establecidas ni validadas, segun reconocimiento explicito del autor.
- Riesgo de alucinacion documentado en la model card, incluyendo la generacion de citas bibliograficas fabricadas, un fallo especialmente peligroso en contexto cientifico.
- Sesgos: el autor advierte de que las salidas pueden reflejar sesgos de los datos subyacentes y no generalizar entre poblaciones.
- Restriccion de uso: "Research use only. Not a medical device. Not FDA-cleared or approved. Not for clinical decision-making".
- Quedan fuera de alcance el diagnostico, tratamiento, triaje, la guia intraoperatoria en tiempo real, el control de equipos de cirugia o perfusion, las situaciones de emergencia y el uso por pacientes como sustituto de consejo profesional.
- Licencia no consolidada: Apache-2.0 aparece etiquetada como "placeholder, subject to change at release", por lo que las condiciones de uso comercial no pueden darse por definitivas.
- Idioma: solo ingles declarado; sin datos sobre calidad en castellano u otras lenguas.
- Privacidad: el autor prohibe introducir informacion de salud protegida (PHI) o datos identificativos de pacientes en la demo.
- La demo anunciada usara un modelo base abierto distinto del modelo final, por lo que no sirve como prueba de rendimiento.
- Advertencia de contexto industrial: la model card vincula el modelo a hardware propietario (SOLO-1) calificado de preclinico y no aprobado por la FDA; no debe interpretarse como respaldo regulatorio de ningun producto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/bunkerlongevity/Miracle-1
- Sitio de Bunker Longevity: https://bunkerlongevity.com
- Documentacion de la plataforma de modelos: https://docs.bunkerbio.com/
- Guia de inicio rapido (ejemplo con BunkerFold-3): https://docs.bunkerbio.com/quickstart
- Portal de inferencia (Boole Inference): https://booleinference.com/
- Contacto del autor: hello@bunkerlongevity.com
- Resultado de busqueda sin relacion verificada con el modelo (plataforma de longevidad independiente): https://longevityai.io/
- Paper, blog tecnico, repositorio de codigo y demo: no disponibles en la informacion proporcionada.
