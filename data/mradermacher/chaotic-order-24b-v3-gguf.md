# mradermacher/Chaotic-Order-24B-V3-GGUF

## Resumen

Chaotic-Order-24B-V3-GGUF es una version cuantizada en formato GGUF del modelo Sorihon/Chaotic-Order-24B-V3, publicada por el usuario mradermacher. Se trata de una conversion estatica (no finetuning) cuyo unico proposito es ofrecer el modelo original en formato GGUF para su uso con motores de inferencia de la familia llama.cpp. El repositorio contiene un conjunto de cuantizaciones precalculadas (de f16 a Q2_K) listas para descargar.

El modelo subyacente tiene 23.572.403.200 parametros (aproximadamente 23,6 mil millones) y esta etiquetado como "conversational", con compatibilidad con endpoints. No se especifica la arquitectura base, el idioma, la licencia ni la longitud de contexto, y no se ha publicado informacion sobre datos de entrenamiento ni resultados de benchmarks.

Su relevancia es limitada y muy reciente: el repositorio se creo el 4 de octubre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes". La informacion publica disponible es minima, por lo que esta ficha se limita a documentar lo que consta de forma explicita y marca como "no disponible" todo lo que no se puede verificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada del modelo base Sorihon/Chaotic-Order-24B-V3) |
| Parametros totales | 23.572.403.200 (~23,6 mil millones) |
| Parametros activos | no aplica / no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (este repositorio); el modelo original esta en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base. El nombre y el recuento de parametros (23,6 mil millones) corresponden a la categoria de modelos densos de ~24B, pero no consta documentado si se trata de un transformer decoder-only convencional, de una mezcla de expertos o de otra variante. Tampoco hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni la existencia de fases de RLHF, DPO u otro tipo de alineamiento.

Lo unico verificable es el proceso de conversion: segun los metadatos de la model card, se empleo `quantize_version: 2`, `output_tensor_quantised: 1` y `convert_type: hf`. Esto indica una conversion desde pesos en formato Hugging Face (safetensors) a GGUF con cuantizacion de los tensores de salida, generando los distintos niveles de cuantizacion listados. Se trata, por tanto, de una cuantizacion estatica sin reentrenamiento.

## Capacidades

- La unica capacidad documentada de forma explicita es la etiqueta "conversational" y la compatibilidad con endpoints.
- No se documentan capacidades especificas de razonamiento, generacion de codigo, matematicas ni vision.
- No consta soporte de tool calling ni de function calling.
- No consta soporte explicito para agentes o razonamiento multi-paso.
- No se especifican capacidades multilingues ni un modo "thinking" diferenciado.
- Al ser un modelo de ~24B con etiqueta conversacional, es razonable esperar generacion de texto conversacional, pero esto no esta confirmado por la documentacion del autor.

## Casos de uso

Dado que no hay informacion verificable sobre rendimiento, contexto o idiomas, los siguientes casos son genericos para un modelo conversacional de ~24B en GGUF y deben validarse empiricamente antes de cualquier uso en produccion:

- Inferencia local en estaciones de trabajo: el modelo puede ejecutarse con llama.cpp u Ollama usando las cuantizaciones Q4_K_M o Q5_K_M, que reducen el uso de memoria respecto a f16 y permiten desplegarlo en GPUs de gama alta de consumo con la memoria suficiente.
- Prototipado de asistentes conversacionales: sirve para iterar sobre prompts y flujos de dialogo antes de decidir si se adopta el modelo en un sistema mayor.
- Despliegue self-hosted con compatibilidad de endpoints: la etiqueta `endpoints_compatible` sugiere que puede servirse detras de una API compatible con OpenAI, lo que facilita su integracion en aplicaciones existentes.
- Experimentacion en investigacion de cuantizacion: al ofrecer 12 niveles distintos (de f16 a Q2_K), es util para estudiar el impacto de la cuantizacion en la calidad de salida.
- Chatbots de dominio acotado: previa evaluacion, podria emplearse en asistentes internos siempre que se verifique el comportamiento en el idioma y el dominio objetivo.
- Pruebas de integracion en pipelines de CI: util para validar que un motor de inferencia (llama.cpp, LM Studio, etc.) carga y ejecuta correctamente el formato GGUF.

En todos los casos, la ausencia de datos de benchmarks y de licencia obliga a realizar una evaluacion propia antes de considerar cualquier uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Los siguientes valores de VRAM son estimaciones calculadas a partir del numero de parametros (23,6B) y del tamano tipico por peso de cada cuantizacion. No proceden de la documentacion del modelo y deben tomarse como orientativos:

- VRAM estimada para inferencia:
  - f16: ~47 GB
  - Q8_0: ~25 GB
  - Q6_K: ~20 GB
  - Q5_K_M: ~17 GB
  - Q4_K_M: ~14-15 GB
  - Q3_K_M: ~12 GB
  - Q2_K: ~9-10 GB
- GPU recomendadas:
  - Para f16 y Q8_0: A100 80 GB, H100 80 GB o configuraciones multi-GPU.
  - Para Q5_K_M y Q4_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB) o L40S.
  - Para cuantizaciones Q3_K y Q2_K: GPUs de 12-16 GB, con posible descarga parcial a CPU.
- Cabe en GPU de consumo: si, en las cuantizaciones Q4_K_M o inferiores dentro de GPUs con 16-24 GB de VRAM, siempre que el contexto utilizado no consuma en exceso el presupuesto de memoria (la longitud de contexto no esta documentada).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y, en general, cualquier motor compatible con GGUF. vLLM y TGI no son la via natural para este repositorio GGUF, aunque podrian usarse partiendo del modelo original en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento, contexto ni licencia de Chaotic-Order-24B-V3, por lo que no es posible una comparacion rigurosa. Se ofrece una comparacion estructural limitada con modelos de la misma categoria de tamano, marcando los campos no verificables.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Chaotic-Order-24B-V3-GGUF | ~23,6B | no disponible | no disponible | GGUF | no disponible |
| Mistral Small 24B | ~24B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | no disponible |
| Modelos densos de ~24B de la familia Qwen/Mistral | ~24B | no disponible en esta ficha | no disponible en esta ficha | safetensors, GGUF | no disponible |

La comparativa detallada con alternativas concretas no esta disponible.

## Limitaciones y advertencias

- No se ha publicado informacion sobre sesgos del modelo; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinacion: no cuantificado, pero presente en cualquier modelo generativo de este tipo.
- Longitud de contexto no documentada: puede condicionar gravemente su uso en tareas que requieran ventanas largas.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento correcto en castellano ni en otros idiomas.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Debe consultarse el repositorio del modelo base (Sorihon/Chaotic-Order-24B-V3) antes de cualquier explotacion comercial.
- Al ser una cuantizacion GGUF, las versiones de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad frente al modelo original.
- El repositorio es muy reciente y sin adopcion (0 descargas, 0 likes): carece de validacion por parte de la comunidad, lo que aumenta el riesgo de comportamiento inesperado.
- No hay model card detallada ni resultados de evaluacion proporcionados por el autor.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Chaotic-Order-24B-V3-GGUF
- Modelo base: https://huggingface.co/Sorihon/Chaotic-Order-24B-V3
- No se han encontrado papers, blogs, repositorios ni demos adicionales relevantes en la busqueda web.
