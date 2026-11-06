# boli-003/mm-safetybench-llavanext8b-m1-vlguard-v1

## Resumen

`mm-safetybench-llavanext8b-m1-vlguard-v1` es un adaptador LoRA de evaluacion en seguridad multimodal, publicado por el usuario `boli-003` en Hugging Face. No es un modelo autonomo: se trata de un adaptador PEFT que debe cargarse sobre la revision exacta del modelo base `llava-hf/llama3-llava-next-8b-hf`, un modelo vision-lenguaje de 8 mil millones de parametros construido sobre Llama 3 y el encoder visual de LLaVA-NeXT. El adaptador forma parte del proyecto de evaluacion de seguridad multimodal MM-SafetyBench, donde recibe la etiqueta "M1" dentro de una familia de componentes (el "M3" seria un revisor visual Qwen3-VL congelado, no incluido aqui).

El adaptador modifica unicamente las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) del modulo de lenguaje, con rango LoRA 16 y alpha 32. Su proposito es servir como artefacto reproducible para evaluar el comportamiento del modelo base frente a entradas multimodales potencialmente daninas, no como un modelo de produccion. La publicacion incluye hashes SHA-256 del adaptador y del arbol de contenido del modelo base, lo que facilita la verificacion de integridad en experimentos de investigacion.

Es relevante ahora porque la evaluacion de seguridad en modelos multimodales es un area activa: los benchmarks tipo MM-SafetyBench necesitan artefactos reproducibles y versionados para comparar defensas y ataques. Este adaptador, aunque de nicho y con muy pocas descargas (11), ejemplifica una practica creciente: publicar adaptadores de seguridad con trazabilidad criptografica y revisiones fijadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal LLaVA-NeXT (Llama 3 8B + encoder visual) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 8B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | llama3 (licencia del modelo base; el adaptador no amplia derechos) |
| Formato de pesos | safetensors (adaptador PEFT) |
| Rango / alpha LoRA | 16 / 32 |
| Modulos objetivo | `.*language_model.*self_attn\.(q_proj\|k_proj\|v_proj\|o_proj)$` |
| Revision del modelo base | `b041c0d0ea0dd0196d147206c210c8d1752fc2da` |
| SHA-256 del adaptador | `b8da66030ab8052354c5092d9336e694263ccbade566377656ef9fdc7bd4e313` |
| SHA-256 del arbol del base | `36e507b2bcff4e9fef8262c955d8a936bc78b578a76152fe4cbbce191666e142` |
| Tamano del repo | 0.1 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LLaVA-NeXT con Llama 3 8B, una arquitectura transformer multimodal que combina un encoder visual (heredero del usado en LLaVA) con un decoder de lenguaje Llama 3. La innovacion del adaptador reside en su alcance: solo se entrenan las proyecciones de autoatencion del modulo de lenguaje, dejando intactos el encoder visual y el resto de capas. El rango 16 y alpha 32 implican una actualizacion de bajo rango relativamente contenida, orientada a modular el comportamiento del modelo sin reentrenar la representacion visual.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF o DPO. La model card indica explicitamente que los datos y scripts de entrenamiento no se incluyen y que los pesos estan congelados. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal; el interes tecnico esta en la trazabilidad (hashes y revision fijada) y en el uso como artefacto de evaluacion de seguridad.

## Capacidades

- Evaluacion de seguridad multimodal: el adaptador esta disenado para probar la robustez del modelo base frente a entradas imagen-texto adversarias o daninas.
- Generacion de texto y razonamiento multimodal: hereda las capacidades del modelo base LLaVA-NeXT 8B, incluyendo descripcion de imagenes y respuesta a preguntas visuales.
- Reproducibilidad experimental: los hashes SHA-256 y la revision fijada permiten replicar exactamente el entorno de evaluacion.
- Integracion con PEFT: carga sencilla mediante la libreria `peft` sobre la revision exacta del modelo base.
- No se documentan capacidades de tool calling, function calling, agentes, thinking mode, audio ni soporte multilingue explicito.

## Casos de uso

- Evaluacion de robustez en seguridad multimodal: cargar el adaptador sobre la revision fijada de LLaVA-NeXT y ejecutar los prompts del paquete de evaluacion del proyecto MM-SafetyBench para medir la tasa de respuestas inseguras ante imagenes adversarias.
- Reproduccion de experimentos academicos: investigadores que necesiten replicar resultados de un paper o informe de seguridad pueden usar los hashes y la revision del base para garantizar la identidad del artefacto.
- Comparacion de defensas: usar este adaptador como linea base "M1" frente a otras variantes (por ejemplo, el revisor visual "M3" con Qwen3-VL) para cuantificar mejoras en filtrado de contenido.
- Auditoria de pipelines de vision-lenguaje: integrar el adaptador en un banco de pruebas que evalue si un despliegue de LLaVA-NeXT rechaza solicitudes peligrosas con entrada visual.
- Docencia en seguridad de IA: emplear el adaptador como ejemplo practico de LoRA de seguridad, con enfasis en verificacion de integridad y gestion de revisiones.
- Verificacion de cadena de suministro de modelos: usar los hashes publicados para comprobar que el adaptador y el base no han sido manipulados antes de incluirlos en un experimento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base LLaVA-NeXT 8B, que en precision completa requiere del orden de 16-20 GB y en cuantizacion de 4 bits puede reducirse sustancialmente (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible; para el modelo base se suelen emplear A100, H100 o RTX 4090, pero el autor no lo especifica.
- Cabe en GPU de consumo: no confirmado; el adaptador en si ocupa 0.1 GB, pero el modelo base condiciona el requisito.
- Opciones de despliegue: carga mediante `peft` sobre el modelo base; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mm-safetybench-llavanext8b-m1-vlguard-v1 | Adaptador LoRA sobre 8B | no disponible | Adaptador de seguridad multimodal | llama3 | Hugging Face (11 descargas) |
| LLaVA-NeXT 8B (base) | 8B | no disponible | Modelo vision-lenguaje | llama3 | Hugging Face |
| Qwen3-VL (revisor M3 del mismo proyecto) | no disponible | no disponible | Modelo vision-lenguaje | no disponible | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargarse sobre la revision exacta `b041c0d0ea0dd0196d147206c210c8d1752fc2da` del base; otras revisiones pueden romper la reproducibilidad.
- Datos y scripts de entrenamiento no incluidos: imposibilita auditar el proceso de entrenamiento o reentrenar el adaptador.
- Licencia llama3: el adaptador no concede derechos adicionales; el uso comercial queda sujeto a los terminos del modelo base Llama 3.
- Riesgo de alucinacion: heredado del modelo base LLaVA-NeXT; no se documentan mitigaciones especificas en el adaptador.
- Sesgos: no documentados por el autor; se desconocen sesgos especificos introducidos por el entrenamiento LoRA.
- Idiomas: no disponibles; no se confirma soporte multilingue.
- Uso previsto limitado a evaluacion e investigacion; no se recomienda para produccion sin validacion adicional.
- El "M3" (Qwen3-VL) mencionado en la model card no esta incluido en este repositorio y debe obtenerse por separado.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/boli-003/mm-safetybench-llavanext8b-m1-vlguard-v1
- Modelo base LLaVA-NeXT 8B: https://huggingface.co/llava-hf/llama3-llava-next-8b-hf
- Proyecto MM-SafetyBench (referencia del nombre): no disponible en la informacion proporcionada
- Paquete GitHub del proyecto de evaluacion: no disponible en la informacion proporcionada
