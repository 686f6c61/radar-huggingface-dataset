# lerobis/BFS-Best-Face-Swap

## Resumen

BFS (Best Face Swap) es una familia de adaptadores LoRA para modelos de edicion de imagen por difusion, orientada especificamente a la sustitucion de rostros y cabezas completas con mezcla natural de tono de piel e iluminacion coherente. El autor es lerobis, que publica el modelo en Hugging Face bajo licencia MIT. No se trata de un modelo base autonomo, sino de un conjunto de pesos LoRA que se aplican sobre Qwen-Image-Edit 2509/2511 y sobre la familia FLUX.2-klein en variantes de 4B y 9B, todos ellos modelos de edicion imagen-a-imagen.

La serie incluye versiones incrementales (Face V1, Head V1 a V5 para Qwen, y Head V1 para FLUX.2-klein) con mejoras progresivas en coincidencia de tono de piel, alineacion de pose, consistencia anatomica y transferencia de expresiones. La version recomendada para Qwen es Head V5 sobre 2511, mientras que para FLUX.2-klein se recomienda Head V1. El repositorio ocupa 10,9 GB y contiene los safetensors de cada variante, ademas de versiones fusionadas con distintos rangos (rank 16 fp16, rank 32 fp32).

El interes actual del modelo radica en que resuelve un caso de uso muy concreto (face swap y head swap de alta fidelidad) sobre modelos de edicion de imagen recientes, con flujos de trabajo publicados para ComfyUI y prompts documentados. Su adopcion es aun limitada (82 descargas, 0 likes en el momento de la consulta), lo que sugiere un modelo de nicho reciente publicado el 31 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelos de difusion de edicion de imagen (Qwen-Image-Edit 2509/2511 y FLUX.2-klein 4B/9B) |
| Parametros totales | no disponible (depende del modelo base; el LoRA en si es de bajo rango) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantizacion | fp16 y fp32 en las versiones fusionadas publicadas (rank 16 fp16, rank 32 fp32); fp8 en los modelos base FLUX.2-klein referenciados |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los pesos son adaptadores LoRA concebidos para inyectarse en modelos de difusion de edicion de imagen. La familia Qwen-Image-Edit 2509/2511 actua como base principal, y la serie FLUX.2-klein (4B y 9B, incluidas variantes fp8) como base alternativa. El autor documenta que la version Head V5 se entreno durante mas de 5.500 pasos sobre el modelo 2511, y que las versiones fusionadas combinan el LoRA Head V4 (entrenado sobre 2509) con el original de 2511 mediante merge de pesos, con rangos 16 y 32.

No se detalla en la informacion disponible la composicion del dataset de entrenamiento, el numero de imagenes utilizadas ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en LoRA de difusion). La innovacion principal es la especializacion por tarea: cada version esta calibrada para un tipo de sustitucion (solo rostro frente a cabeza completa) y para un orden de entrada concreto, con prompts especificos que el autor documenta como parte del flujo de trabajo. Las versiones V3, V4 y V5 invierten el orden de las imagenes de entrada (cuerpo primero, rostro despues), un detalle critico para el uso correcto.

## Capacidades

- Face swap selectivo: sustituye solo el rostro preservando el cabello, la iluminacion y el fondo de la imagen objetivo (Face V1).
- Head swap completo: transfiere la cabeza entera con mezcla natural entre cabeza, cabello y cuerpo del objetivo (Head V1 a V5).
- Coincidencia de tono de piel y sombras: las versiones V2 en adelante mejoran la integracion cromatica entre la cabeza transferida y el cuerpo receptor.
- Alineacion de pose y consistencia anatomica: V2 y posteriores corrigen proporciones y orientacion de la cabeza.
- Transferencia de expresiones: V4 y V5 mejoran la reproduccion de un rango mas amplio de microexpresiones y direccion de la mirada.
- Conservacion de identidad: V4 y V5 preservan rasgos faciales, textura de piel, color de ojos y estructura nasal del rostro de origen.
- Integracion con ComfyUI: el autor publica flujos de trabajo descargables para Qwen-Image-Edit 2509.
- Compatibilidad multiplataforma de modelos base: funciona sobre Qwen-Image-Edit 2509/2511 y FLUX.2-klein 4B/9B.
- Soporte de prompts en ingles con instrucciones detalladas de edicion.

## Casos de uso

- Produccion audiovisual y doblaje: sustitucion de rostros de actores entre tomas para mantener continuidad de personaje cuando el rodaje requiere planos adicionales, usando Head V5 sobre Qwen-Image-Edit 2511 con el prompt de conservacion de identidad.
- Creacion de contenido para redes sociales: generacion de variantes de una misma imagen con distintos rostros manteniendo iluminacion y fondo originales, gracias al modo Face V1 que preserva cabello y entorno.
- Prototipado de personajes en videojuegos: aplicacion de un rostro de referencia sobre cuerpos y poses generados, usando la alineacion de pose de Head V2 para integrar la cabeza con la anatomia del modelo 3D renderizado.
- Edicion fotografica profesional: retoque de retratos de estudio donde se necesita reemplazar la cabeza del sujeto por otra toma con mejor expresion, manteniendo la iluminacion del set original mediante Head V3 o V4.
- Investigacion en sintesis de imagen: evaluacion comparativa de tecnicas de face swap sobre distintas bases (Qwen frente a FLUX.2-klein) usando los mismos prompts documentados por el autor.
- Generacion de avatares personalizados: creacion de retratos de perfil con un rostro concreto sobre cuerpos y escenarios variados, aprovechando la mezcla de tono de piel de Head V2.
- Pruebas de concepto en pipelines de ComfyUI: integracion del LoRA en flujos nodales de edicion de imagen para automatizar sustituciones por lotes, con los workflows publicados en Civitai como punto de partida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; depende del modelo base. Un LoRA de difusion sobre un modelo de 4B en fp16 requiere del orden de 8-12 GB, y sobre un modelo de 9B en fp16 del orden de 18-24 GB, aunque estas cifras son estimaciones generales y no datos publicados por el autor.
- GPU recomendadas: para FLUX.2-klein 4B, tarjetas consumer de gama alta como RTX 4090 (24 GB) o RTX 4080; para Qwen-Image-Edit 2511 y FLUX.2-klein 9B, se recomienda A100 (40/80 GB) o H100 para inferencia comoda en fp16.
- Cabe en GPU consumer: si, las variantes de 4B en fp8 o fp16 caben en RTX 4090 y posiblemente en RTX 3090; las de 9B requieren cuantizacion o fp8 para ajustarse a 24 GB.
- Opciones de despliegue: diffusers (libreria declarada), ComfyUI (flujos publicados por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BFS Best Face Swap (lerobis) | LoRA de face/head swap | Qwen-Image-Edit 2509/2511 y FLUX.2-klein 4B/9B | no aplica | MIT | Hugging Face, 82 descargas |
| Qwen-Image-Edit 2511 | Modelo base de edicion de imagen | no disponible | no aplica | no disponible | Hugging Face (Qwen) |
| FLUX.2-klein 9B | Modelo base de edicion de imagen | 9B | no aplica | no disponible | Hugging Face (black-forest-labs) |
| FLUX.2-klein 4B | Modelo base de edicion de imagen | 4B | no aplica | no disponible | Hugging Face (black-forest-labs) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparativa se limita a aspectos estructurales y de licencia.

## Limitaciones y advertencias

- Orden de entrada invertido en las versiones V3, V4, V5 y FLUX.2-klein: si se envian las imagenes en el orden incorrecto (rostro primero), el resultado sera erroneo; el autor lo advierte explicitamente.
- Dependencia estricta del modelo base: el LoRA no funciona de forma autonoma; requiere cargar Qwen-Image-Edit 2509/2511 o FLUX.2-klein 4B/9B, con el coste de VRAM asociado.
- Prompts en ingles: el autor solo documenta instrucciones en ingles, lo que limita su uso directo en castellano sin traduccion.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar artefactos anatomicos, inconsistencias en la iluminacion o rasgos faciales distorsionados, especialmente en poses extremas o resoluciones bajas.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre rostros humanos hereda los sesgos demograficos de los datos del modelo base y del dataset del LoRA.
- Uso etico y legal: la sustitucion de rostros sin consentimiento puede infringir derechos de imagen y normativas de proteccion de datos; la licencia MIT no exime del cumplimiento legal en la jurisdiccion de uso.
- Madurez limitada: con 82 descargas y 0 likes, hay poca validacion comunitaria; el autor reconoce que la version V5 "no es perfecta todavia".
- Licencia MIT del LoRA: permite uso comercial, pero conviene verificar las licencias de los modelos base (Qwen-Image-Edit y FLUX.2-klein), que no se detallan en la informacion disponible.

## Enlaces

- Hugging Face: https://huggingface.co/lerobis/BFS-Best-Face-Swap
- Workflow ComfyUI (Civitai): https://civitai.com/articles/20190/headface-swap-workflow-qwen-image-edit-2509
- Modelo base Qwen-Image-Edit 2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Modelo base FLUX.2-klein 9B: https://huggingface.co/black-forest-labs/FLUX.2-klein-9B
- Modelo base FLUX.2-klein 4B: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
