# houseofboern/bustlook-krea2-v1

## Resumen

bustlook-krea2-v1 es un adaptador LoRA publicado por houseofboern para el modelo de imagen text-to-image krea/Krea-2-Raw. El repositorio lo etiqueta con los términos lora, krea2, body y not-for-all-audiences, y no incluye una model card con especificaciones, dataset o parámetros de entrenamiento. Su función declarada, deducida del identificador y las etiquetas, es orientar la generación hacia composiciones de busto y cuerpo sobre Krea 2; no es un modelo autónomo.

El interés es acotado: se trata de un adaptador de nicho con 0 descargas y 0 likes en el momento de la consulta, sin benchmarks ni documentación técnica pública. Para evaluarlo hace falta cargar el modelo base y un runtime compatible con adaptadores LoRA, y revisar los términos de licencia, que figuran como other sin detalle.

Es relevante solo para flujos de generación de imágenes que ya usen Krea 2 y necesiten un ajuste de composición corporal; no aporta contexto largo, tool calling ni capacidades de lenguaje. La etiqueta not-for-all-audiences exige controles de acceso y moderación si se despliega en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre el modelo de imagen text-to-image krea/Krea-2-Raw; arquitectura interna del modelo base no disponible |
| Parámetros totales | no disponible |
| Longitud de contexto | no aplica (modelo text-to-image); no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles; la interpretación del prompt depende del pipeline de Krea 2 |
| Licencia | other; términos concretos no disponibles |
| Formato de pesos | no disponible |
| Modelo base | krea/Krea-2-Raw |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

El repositorio identifica el artefacto como un LoRA, es decir, un adaptador de bajo rango que se aplica sobre un modelo base para modificar su comportamiento sin reentrenar todos sus pesos. No se especifican el rango, el valor alpha, los módulos objetivo ni la arquitectura interna de Krea-2-Raw; por tanto, no es posible confirmar si el adaptador afecta a mecanismos de atención, capas MLP u otros componentes.

No hay información pública sobre el número de pasos de entrenamiento, el dataset utilizado, la composición de las imágenes, el uso de RLHF/DPO ni posibles innovaciones técnicas. Tampoco se documentan técnicas de decodificación especulativa, atención lineal o control explícito de composición. La única información verificable es la etiqueta body y el nombre bustlook, que apuntan a un ajuste de encuadre y proporciones corporales.

## Capacidades

- Generación de imágenes text-to-image mediante el modelo base krea/Krea-2-Raw; el adaptador modula la composición de busto y cuerpo.
- Ajuste del encuadre y de las proporciones corporales en las imágenes generadas, según las etiquetas del repositorio.
- No funciona como modelo autónomo: requiere cargar Krea-2-Raw y aplicar el LoRA en un runtime compatible.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No declara capacidades multilingües propias; el prompt se procesa con el pipeline del modelo base.
- No incluye visión, audio, thinking mode ni generación de texto.
- Puede producir contenido no apto para todos los públicos, según la etiqueta not-for-all-audiences.
- No incorpora mecanismos propios de moderación o verificación de edad.

## Casos de uso

- Retratos de busto para previsualización de personajes: cargar Krea 2 con el LoRA y generar variaciones de encuadre de busto para elegir dirección de arte; el adaptador reduce la necesidad de describir la composición en el prompt, aunque no hay métricas públicas de mejora.
- Pruebas de vestuario y proporciones corporales: usar el adaptador en prototipado de moda para generar cuerpos y encuadres coherentes antes de una sesión fotográfica; requiere revisión humana por posibles artefactos anatómicos.
- Creación de avatares ficticios: generar retratos de personas inexistentes para videojuegos, narrativa o material promocional; no debe emplearse con personas reales sin consentimiento explícito.
- Moodboards y preproducción creativa: producir lotes de imágenes de referencia con encuadre de busto o cuerpo para equipos de diseño; se puede integrar en ComfyUI si existe compatibilidad con Krea-2-Raw y adaptadores LoRA.
- Investigación comparativa de adaptadores LoRA: medir la deriva visual frente a Krea-2-Raw y otros LoRA del mismo autor, como pose-pack o skinlook; es útil para estudiar el efecto de adaptadores de bajo rango, pero no hay benchmarks publicados.
- Generación de contenido para audiencias adultas bajo control de acceso: la etiqueta not-for-all-audiences permite plantear un despliegue en plataformas con verificación de edad y moderación; exige revisión legal y políticas claras de uso.
- Automatización por lotes de assets en entornos controlados: generar imágenes de busto para catálogos ficticios o pruebas internas mediante un pipeline con GPU; no hay latencia ni throughput publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un LoRA, la VRAM la determina Krea-2-Raw, la resolución de salida y el tamaño de lote; el repositorio no publica cifras.
- GPU recomendadas: no disponibles. No hay requisitos oficiales en la información proporcionada.
- ¿Cabe en GPU de consumo?: no confirmado. Depende del modelo base, la resolución y la cuantización; no hay datos para afirmarlo.
- Opciones de despliegue: no verificadas. Se requiere un runtime que cargue krea/Krea-2-Raw y aplique adaptadores LoRA; Diffusers o ComfyUI solo si el modelo base y el adaptador son compatibles.
- llama.cpp u Ollama: no consta soporte para este adaptador de imagen; son entornos orientados principalmente a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bustlook-krea2-v1 | LoRA text-to-image orientado a busto y cuerpo | krea/Krea-2-Raw | no disponible | no aplica | other | 0 descargas y 0 likes en la consulta |
| pose-pack-krea2-v1 | LoRA text-to-image orientado a pose | Krea 2, según el nombre | no disponible | no aplica | other | repositorio público; sin métricas de rendimiento |
| skinlook-krea2-v1 | LoRA text-to-image orientado a textura de piel | Krea 2 | no disponible | no aplica | other | repositorio público; sin métricas de rendimiento |
| lightlook-krea2-v1 | LoRA text-to-image; función no detallada | Krea 2, según el nombre | no disponible | no aplica | no disponible | registro de terceros; sin ficha técnica completa |
| krea/Krea-2-Raw | Modelo base text-to-image | — | no disponible | no aplica | no disponible | referenciado como base del adaptador |

## Limitaciones y advertencias

- No es un modelo independiente: sin Krea-2-Raw y un runtime compatible, el adaptador no genera imágenes.
- No hay model card detallada: se desconocen dataset, proceso de entrenamiento, sesgos y condiciones de uso previstas.
- Licencia other sin términos concretos: no se puede confirmar si el uso comercial está permitido; hay que consultar la licencia del repositorio y del modelo base.
- Etiqueta not-for-all-audiences: puede generar contenido no apto para todos los públicos; requiere control de acceso, verificación de edad y moderación.
- Riesgo de artefactos visuales: como todo modelo de imagen, puede producir anatomía incorrecta, incoherencias de encuadre o desviaciones respecto al prompt; no hay evaluación publicada.
- Sesgos no documentados: el adaptador puede heredar sesgos de representación del modelo base y de sus datos de entrenamiento.
- No hay soporte multilingüe declarado: el comportamiento con prompts en distintos idiomas depende del pipeline de Krea 2 y no está documentado.
- Madurez baja: 0 descargas y 0 likes en el momento de la consulta, sin validación de la comunidad ni benchmarks.
- Riesgo de uso indebido: no debe emplearse para generar imágenes de personas reales sin consentimiento ni para desinformación o suplantación.
- Compatibilidad no garantizada: no se confirma que funcione en todas las versiones de Diffusers, ComfyUI u otros entornos de inferencia.

## Enlaces

- [houseofboern/bustlook-krea2-v1 en Hugging Face](https://huggingface.co/houseofboern/bustlook-krea2-v1)
- [krea/Krea-2-Raw en Hugging Face](https://huggingface.co/krea/Krea-2-Raw)
- [houseofboern/pose-pack-krea2-v1 en Hugging Face](https://huggingface.co/houseofboern/pose-pack-krea2-v1)
- [houseofboern/skinlook-krea2-v1 en Hugging Face](https://huggingface.co/houseofboern/skinlook-krea2-v1)
- [Registro de lightlook-krea2-v1 en free2aitools](https://free2aitools.com/model/houseofboern/lightlook-krea2-v1)
- [Dashboard de Krea 2 en hunted.space](https://hunted.space/dashboard/krea)
- [Registro de pose-pack-krea2-v1 en Essa Mamdani](https://essamamdani.com/ai-models/hf-houseofboern-pose-pack-krea2-v1)

No se han encontrado paper, blog técnico ni demo oficial en la búsqueda.
