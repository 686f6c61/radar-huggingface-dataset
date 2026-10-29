# aeoncrux/Krea2-CharacterLora-KajalAggarwal

## Resumen

Krea2-CharacterLora-KajalAggarwal es un adaptador LoRA (Low-Rank Adaptation) para el modelo generativo de imagenes Krea2, publicado por el usuario aeoncrux en Hugging Face en octubre de 2026. No se trata de un modelo de lenguaje ni de un modelo generativo completo, sino de un peso adicional de pequeno tamano (0,2 GB el repositorio completo) que inyecta la apariencia de una persona real, la actriz india Kajal Aggarwal, en las generaciones del modelo base Krea2.

El LoRA se entreno con 25 imagenes de alta resolucion recopiladas mediante busqueda de imagenes de Google, usando la herramienta AI-Toolkit de Ostris sobre el modelo base "Krea2 raw". El entrenamiento se realizo en hardware de consumo (16 GB de VRAM y 32 GB de RAM) durante unas 8 horas y unos 2.500 pasos, con cache activada y resoluciones de 512, 768 y 1024 pixeles. Los pie de foto automaticos se generaron con el modelo huihui_ai/gemma-4-abliterated:12b en modo thinking, limitados a 50 palabras.

Su relevancia es principalmente como ejemplo documentado de un pipeline completo y reproducible de entrenamiento de LoRAs de personaje en hardware domestico: recopilacion de datos, recorte manual, captioning con un modelo de vision-language y ajuste con AI-Toolkit. La licencia del repositorio es apache-2.0, aunque esto no ampara el uso de la semejanza de la persona representada (ver limitaciones).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre el modelo generativo de imagenes Krea2; arquitectura detallada del modelo base no disponible |
| Parametros totales | no disponible (tamano del repositorio: 0,2 GB) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (adaptador para generacion de imagenes, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable; los prompts dependen del modelo base Krea2 (no disponible) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB, formato no especificado en la model card) |
| Modelo base | Krea2 (uso recomendado con Krea2-Turbo) |
| Datos de entrenamiento | 25 imagenes de alta resolucion |
| Pasos de entrenamiento | ~2.500 |
| Resoluciones de entrenamiento | 512, 768 y 1024 pixeles |
| Intensidad de LoRA recomendada | 1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un LoRA: en lugar de reentrenar el modelo generativo completo, se ajusta un conjunto reducido de pesos de bajo rango que se suma al modelo base Krea2 en tiempo de inferencia. Esto explica el tamano contenido del repositorio (0,2 GB) y permite que el entrenamiento quepa en una GPU de consumo. El modelo base recomendado por el autor es Krea2-Turbo, con generaciones a 2048x2048 pixeles para obtener los mejores resultados.

El pipeline de entrenamiento documentado en la model card consta de cuatro fases: (1) recopilacion de 25 imagenes de alta calidad mediante busqueda de imagenes de Google filtrada por resolucion; (2) recortes manuales para mantener una proporcion equilibrada entre retratos, planos medios y planos de cuerpo entero; (3) captioning automatico con huihui_ai/gemma-4-abliterated:12b en modo thinking, con un limite de 50 palabras y el prompt de captioning por defecto de AI-Toolkit; y (4) entrenamiento local con AI-Toolkit de Ostris sobre el modelo Krea2 raw, con ajustes por defecto, cache activada, resoluciones multiples (512/768/1024) y unos 2.500 pasos en aproximadamente 8 horas. El conjunto de datos incluia imagenes de la persona tanto en su version mas joven como mas actual, por lo que el autor indica que anadir el prefijo "young" al prompt permite obtener versiones mas jovenes del personaje.

No se ha documentado el rango del LoRA, la red del adaptador ni otros hiperparametros concretos.

## Capacidades

- Generacion de imagenes del personaje objetivo (semejanza de una persona real identificable) al combinar el LoRA con el modelo base Krea2.
- Funcionamiento optimizado a 2048x2048 pixeles con la variante Krea2-Turbo, segun la model card.
- Cobertura de composiciones variadas: retratos, planos medios y planos de cuerpo entero, gracias al equilibrio del dataset de entrenamiento.
- Control de la edad aparente del personaje mediante el prefijo "young" en el prompt, aprovechando que el dataset incluia ambas etapas.
- Mejora de fidelidad proporcional a la descripcion del prompt: el autor recomienda prompts lo mas descriptivos posible.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento, codigo, matematicas, tool calling, function calling ni agentes. Tampoco incorpora vision, audio ni modo de pensamiento propios; esas funciones, si existen, corresponden al modelo base o a herramientas externas del pipeline.

## Casos de uso

- Reproduccion educativa del pipeline de entrenamiento: la model card documenta paso a paso como construir un LoRA de personaje (recopilacion, recorte, captioning con un VLM y entrenamiento con AI-Toolkit), lo que lo convierte en una referencia practica para aprender a entrenar adaptadores en hardware domestico.
- Formacion y experimentacion en hardware de consumo: el entrenamiento completo se realizo con 16 GB de VRAM y 32 GB de RAM en unas 8 horas, un perfil util para planificar los requisitos computacionales de proyectos similares sin recurrir a la nube.
- Investigacion en consistencia de identidad: permite estudiar como 25 imagenes y 2.500 pasos afectan a la fidelidad de identidad en difusion, comparando las muestras "sin LoRA" y "con LoRA" incluidas en la model card.
- Validacion de captioning automatico: el uso de gemma-4-abliterated:12b en modo thinking con limite de 50 palabras es un flujo de captioning replicable para evaluar el impacto de la calidad de los pie de foto en el resultado final.
- Pruebas de compatibilidad de LoRAs con Krea2-Turbo: sirve como caso de prueba para verificar como las herramientas de inferencia cargan y aplican adaptadores sobre este modelo base a 2048x2048.
- Estudio de control de atributos por prompt: el prefijo "young" como mecanismo de condicionacion de edad es un ejemplo concreto de steering de atributos entrenado en el dataset, util para experimentos de edicion dirigida.
- Generacion de ilustraciones con la semejanza de la persona representada: unicamente en contextos en los que se cuente con el permiso del sujeto o el uso encaje en las excepciones legales aplicables; cualquier otro empleo conlleva riesgos legales y eticos graves (ver limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score ni evaluaciones de fidelidad de identidad); la unica evidencia de rendimiento son las imagenes comparativas cualitativas "sin LoRA" y "con LoRA" incluidas en el README. El repositorio ademas registra 0 descargas, por lo que no existe validacion comunitaria de los resultados.

## Requisitos de hardware

- Entrenamiento (dato documentado): 16 GB de VRAM y 32 GB de RAM fueron suficientes para completar el entrenamiento con cache activada a resoluciones 512/768/1024; no se especifica el modelo exacto de GPU utilizado.
- Inferencia: el LoRA en si pesa unos 0,2 GB, por lo que el coste de VRAM en inferencia viene determinado por el modelo base Krea2 o Krea2-Turbo; no disponible el consumo concreto.
- Resolucion de inferencia recomendada: 2048x2048 pixeles con Krea2-Turbo, lo que implica requisitos de memoria superiores a los de generaciones a 1024 pixeles; cifras exactas no disponibles.
- Consumer GPU: el perfil de entrenamiento (16 GB de VRAM) es alcanzable por GPUs de consumo de gama media-alta actuales; para inferencia, la idoneidad depende del modelo base y no consta.
- Despliegue: el entrenamiento se realizo con Ostris AI-Toolkit; la model card no especifica frameworks de inferencia (ComfyUI, diffusers, etc.), por lo que la compatibilidad concreta no disponible. El uso previsto es cargar el LoRA junto al modelo base Krea2 en herramientas compatibles con este formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Datos de entrenamiento | Licencia | Observaciones |
|---|---|---|---|---|---|
| aeoncrux/Krea2-CharacterLora-KajalAggarwal (este modelo) | LoRA de personaje | Krea2 | 25 imagenes documentadas | apache-2.0 | Pipeline completo documentado; 0 descargas |
| rthala135790/kajal-krea2v1 | LoRA de personaje | Krea2 (v1) | no disponible | no disponible | Otro LoRA de la misma persona en Hugging Face; detalles no disponibles |
| Kajal Aggarwal Krea 2 - V1 (Tensor.Art, autor Wizardof) | LoRA de personaje | Krea 2 | no disponible | no disponible | Alojado en Tensor.Art (y espejo en TensorHub Art), fuera de Hugging Face |
| KREA 2 - Character Sheets (Tensor.Art) | LoRA de utilidad/estilo | Krea 2 | no disponible | no disponible | Orientado a hojas de personaje multivista con consistencia de identidad, no a una persona concreta |

No se disponen de datos de rendimiento comparables entre estos modelos, por lo que la comparacion se limita a caracteristicas declaradas.

## Limitaciones y advertencias

- Semejanza de una persona real sin consentimiento documentado: el LoRA reproduce la apariencia de una actriz identificable a partir de imagenes publicas de internet. La propia model card reconoce que captura la semejanza de un individuo real y traslada toda la responsabilidad al usuario que descarga el modelo.
- Riesgo elevado de deepfakes: al tratarse de una figura publica, el modelo puede generar imagenes enganosas que la atribuyan a declaraciones, acciones o situaciones que nunca ocurrieron. Esto puede ser ilegal en multiples jurisdicciones y vulnera tipicamente los derechos de imagen y personalidad, con independencia de la licencia apache-2.0 del codigo.
- La licencia apache-2.0 cubre los pesos del adaptador, no la semejanza de la persona: usar la apariencia de una persona real con fines comerciales o difamatorios puede infringir derechos de imagen, derecho al honor y normativa de proteccion de datos (incluido el RGPD en la Union Europea).
- Dataset muy reducido: 25 imagenes y 2.500 pasos son insuficientes para una generalizacion robusta; es esperable sobreajuste, artefactos en poses, angulos o iluminaciones no presentes en el dataset y degradacion de la identidad en composiciones complejas.
- Captioning con un modelo "abliterated": los pie de foto se generaron con una variante sin filtros de un modelo de vision-language, lo que puede introducir ruido o descripciones imprecisas en el entrenamiento.
- Comportamiento por defecto hacia la version madura: sin el prefijo "young", el LoRA reproduce por defecto la version mas reciente del personaje, algo que hay que tener en cuenta al redactar prompts.
- Sin validacion ni metricas: 0 descargas, 0 likes y ausencia total de benchmarks o evaluaciones publicadas; la calidad declarada se apoya unicamente en imagenes de ejemplo seleccionadas por el autor.
- Dependencia del modelo base: la calidad, los sesgos y las limitaciones de Krea2 y Krea2-Turbo se heredan integramente; no disponible informacion sobre los sesgos del modelo base en la documentacion proporcionada.
- Riesgo de alucinacion visual: como en todo modelo generativo de imagenes, pueden aparecer anatomias incorrectas, texto incoherente y elementos espurios, agravados posiblemente por el tamano del dataset.
- Restricciones de plataforma: la generacion de imagenes no consensuadas de personas reales puede violar las politicas de uso de Hugging Face y de las plataformas donde se despliegue el modelo.

## Enlaces

- [aeoncrux/Krea2-CharacterLora-KajalAggarwal en Hugging Face](https://huggingface.co/aeoncrux/Krea2-CharacterLora-KajalAggarwal)
- [rthala135790/kajal-krea2v1 en Hugging Face](https://huggingface.co/rthala135790/kajal-krea2v1)
- [Kajal Aggarwal Krea 2 - V1 en Tensor.Art](https://tensor.art/models/1025971744155945613)
- [Kajal Aggarwal Krea 2 - V1 en TensorHub Art (espejo)](https://tensorhub.art/models/1025971744155945613)
- [KREA 2 - Character Sheets en Tensor.Art](https://tensor.art/models/1040901836455858452)
- [Repositorio de AI-Toolkit de Ostris (herramienta de entrenamiento citada en la model card)](https://github.com/ostris/ai-toolkit)
