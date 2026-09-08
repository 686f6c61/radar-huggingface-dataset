# rachel-luxangel-ai/zit-sunzhenni

## Resumen

El modelo `zit-sunzhenni` es un adaptador LoRA (Low-Rank Adaptation) para el modelo de difusión Tongyi-MAI/Z-Image-Turbo. Ha sido desarrollado por el usuario `rachel-luxangel-ai` y está publicado en Hugging Face bajo la licencia `other`. Su propósito es añadir un personaje femenino específico, identificado por el trigger `sunzhenni`, al modelo base, de modo que se puedan generar imágenes fotorrealistas de una joven con rasgos faciales definidos (rostro ovalado, ojos almendrados, piel clara, pelo negro largo).

El adaptador se entrenó con RunComfy AI Toolkit utilizando 23 pares de imagen y caption, y se guardó en el checkpoint 3000. La fuerza recomendada del LoRA es 0.8. El tamaño del repositorio es de 0.2 GB, lo que corresponde únicamente a los pesos del adaptador, no al modelo base. No se han publicado especificaciones sobre el número de parámetros, el contexto ni los idiomas soportados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) sobre modelo de difusión base |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo text-to-image) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible |
| Modelo base | Tongyi-MAI/Z-Image-Turbo |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA, no un modelo completo. Se aplica sobre el modelo de difusión Tongyi-MAI/Z-Image-Turbo y modifica la generación para producir un personaje concreto. El entrenamiento se realizó con RunComfy AI Toolkit, utilizando 23 pares de imágenes y captions, y se guardó en el checkpoint 3000. La fuerza del adaptador es 0.8, y el personaje se activa mediante un prompt de disparo (trigger words) que debe incluirse en la instrucción. No se han proporcionado detalles sobre la composición del dataset, el número de tokens de entrenamiento ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de prompts de texto: el modelo produce retratos fotorrealistas de un personaje femenino con rasgos específicos.
- Representación consistente del personaje: mediante el trigger completo, se mantiene la identidad visual en múltiples generaciones.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible; la entrada son prompts en texto, pero no se especifica soporte de idiomas.
- Capacidad especial: adaptación de personaje mediante LoRA sobre el modelo base Z-Image-Turbo; no incluye visión, audio ni otras modalidades.

## Casos de uso

- Ilustración de personajes para novelas visuales: el modelo permite generar múltiples escenas con el mismo personaje femenino manteniendo la coherencia facial. Se usaría incluyendo el trigger completo en cada prompt y ajustando la fuerza a 0.8.
- Creación de maquetas publicitarias: los retratos fotorrealistas generados pueden servir como imágenes provisionales para campañas, permitiendo iterar sobre el estilo sin necesidad de sesiones fotográficas.
- Prototipado de personajes para videojuegos: el modelo puede producir variaciones de un personaje en diferentes entornos y atuendos, lo que facilita la exploración de diseños.
- Generación de contenido para redes sociales: se pueden crear imágenes consistentes de una influencer ficticia para publicaciones, manteniendo una identidad visual reconocible.
- Portadas de libros o revistas: el modelo genera retratos con iluminación de estudio y fondos sencillos, aptos para composiciones editoriales.
- Generación de datasets sintéticos: las imágenes producidas pueden utilizarse como datos de entrenamiento para otros modelos, siempre que la licencia lo permita y se respeten los derechos de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.2 GB, pero la inferencia requiere cargar el modelo base Tongyi-MAI/Z-Image-Turbo, cuyos requisitos de hardware no se han proporcionado.
- VRAM estimada para la inferencia: no disponible.
- GPU recomendada: no disponible.
- No se indica si es ejecutable en GPU de consumo; depende del modelo base.
- Opciones de despliegue: diffusers, RunComfy AI Toolkit; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables. El autor tiene otros LoRA de personajes (`zit-ju`, `zit-mai`) en Hugging Face, pero no se dispone de especificaciones técnicas ni benchmarks.

## Limitaciones y advertencias

- El modelo está diseñado para representar a una persona real (una actriz), por lo que su uso puede vulnerar derechos de imagen y requerir consentimiento explícito.
- Riesgo de alucinación: al estar entrenado con solo 23 pares de imágenes, puede generar inconsistencias faciales o artefactos en los retratos.
- Limitaciones de generalización: el LoRA está especializado en un personaje y puede fallar con otros estilos o sujetos.
- Restricciones de licencia: la licencia `other` en Hugging Face puede imponer condiciones de uso comercial; es necesario revisar los términos antes de desplegar el modelo en producción.
- No se ha proporcionado información sobre sesgos, pero el modelo puede heredar sesgos del modelo base Z-Image-Turbo.
- La generación de imágenes de personas reales está sujeta a regulaciones de consentimiento y puede ser inapropiada en ciertos contextos.

## Enlaces

- Hugging Face: https://huggingface.co/rachel-luxangel-ai/zit-sunzhenni
- No se han encontrado papers, blogs o demos adicionales en la información disponible.
