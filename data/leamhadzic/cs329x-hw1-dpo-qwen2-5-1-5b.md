# leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b

## Resumen

El modelo `leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Lo desarrolla el usuario leamhadzic como entrega del trabajo 1 del curso CS 329X de Stanford, y su proposito no es competir en capacidades generales, sino demostrar el flujo completo de alineamiento por preferencias sobre un modelo pequeno en hardware de consumo. El adaptador tiene rango 8 y alpha 16, aplicado unicamente a las proyecciones `q_proj` y `v_proj`, y se entreno sobre el modelo base cuantizado en 4 bits NF4.

La relevancia de esta ficha es acotada y conviene ser explicito: se trata de un artefacto educativo, con cero descargas y cero likes en el momento de la consulta, un tamano de repositorio de 0,0 GB y un dataset de preferencias de 378 pares construidos a partir de las anotaciones de una sola persona sobre 18 prompts del dataset PRISM. La propia model card indica que las salidas difieren solo ligeramente de las del modelo base y que el uso previsto es exclusivamente educativo.

Por tanto, no debe evaluarse como un modelo de produccion. Su interes tecnico esta en la receta: DPO con beta 0,1 sobre LoRA, learning rate 2e-4, batch efectivo 8, 3 epocas (141 pasos) y aproximadamente 30 minutos de entrenamiento en una unica GPU Colab T4, con una perdida media de entrenamiento final de 0,38. Es un ejemplo reproducible de personalizacion de bajo coste sobre un transformer decoder-only de 1,5 mil millones de parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only denso: Qwen/Qwen2.5-1.5B-Instruct. Configuracion LoRA: r=8, alpha=16, modulos `q_proj` y `v_proj` |
| Parametros totales | No disponible con exactitud. Modelo base: 1.500 millones de parametros aproximadamente; el adaptador LoRA publica un unico fichero de pesos de adaptador (repositorio de 0,0 GB) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible en la informacion proporcionada. El modelo base Qwen2.5-1.5B-Instruct declara una ventana de hasta 32.768 tokens en su propia model card, dato no verificado en esta ficha |
| Tipos de cuantizacion | Modelo base entrenado con cuantizacion 4-bit NF4 (bitsandbytes, `bnb_4bit_compute_dtype=torch.bfloat16`). El ejemplo de uso oficial carga el adaptador sobre base en 4 bits. No se publican pesos GGUF ni cuantizaciones pregeneradas |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere cargar por separado el modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen2.5-1.5B-Instruct, un transformer decoder-only denso de la familia Qwen2.5. Sobre el se anade un adaptador LoRA de bajo rango (r=8, alpha=16) restringido a las proyecciones de atencion `q_proj` y `v_proj`. No se modifica ningun peso del modelo base: la inferencia requiere cargar Qwen2.5-1.5B-Instruct y superponer el adaptador con `PeftModel`. La model card no documenta innovaciones arquitectonicas propias ni cambios en el mecanismo de atencion.

El entrenamiento usa DPO con beta 0,1 sobre 378 pares de preferencia, construidos a partir de las clasificaciones de una unica persona sobre las respuestas a 18 prompts del dataset PRISM (HannahRoseKirk/prism-alignment). Los hiperparametros son learning rate 2e-4, batch efectivo 8, 3 epocas y 141 pasos totales, sobre un modelo base cuantizado en 4 bits NF4. El computo fue de aproximadamente 30 minutos en una unica GPU Colab T4, con una perdida media de entrenamiento final de 0,38. No se menciona RLHF, SFT adicional ni ninguna fase de alineamiento posterior al DPO. El preentrenamiento y el ajuste por instrucciones corresponden integramente al modelo base, no a este adaptador.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen2.5-1.5B-Instruct y modulada por el adaptador DPO.
- Modulacion de estilo y preferencias: el adaptador desplaza ligeramente la distribucion de respuestas hacia las preferencias del anotador unico usado en el entrenamiento, no hacia un criterio general de calidad.
- Formato de chat: usa la plantilla de chat del tokenizer del modelo base via `apply_chat_template` con `add_generation_prompt=True`.
- Compatibilidad con decodificacion greedy (`do_sample=False`) tal y como se documenta en el ejemplo oficial de uso.
- Razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y capacidades de agente: no documentadas para el adaptador. Cualquier capacidad de este tipo dependeria exclusivamente del modelo base y no esta verificada aqui.
- Capacidades multilingues: solo se declara ingles (`en`); no hay evidencia de soporte en castellano ni en otros idiomas.
- No se documenta modo thinking, modo razonamiento explicito ni capacidades especiales adicionales.

## Casos de uso

- Replicacion academica de un pipeline DPO completo: el adaptador sirve como referencia reproducible para un ejercicio de clase, ya que documenta dataset, hiperparametros, hardware y tiempo de entrenamiento, y permite repetir el experimento en una T4 en menos de una hora.
- Docencia de alineamiento por preferencias: util para ilustrar en un aula la diferencia entre SFT, RLHF y DPO, y para medir experimentalmente cuanto cambia un modelo de 1,5 B tras un DPO sobre 378 pares.
- Experimentos de personalizacion con un solo anotador: permite estudiar como se comporta un adaptador entrenado con las preferencias de una unica persona y compararlo con el modelo base en las mismas 18 prompts de PRISM.
- Pruebas de infraestructura PEFT + bitsandbytes: sirve como caso minimo para validar que un servidor carga correctamente un modelo base cuantizado en 4 bits NF4 y le superpone un adaptador LoRA en safetensors.
- Evaluacion de metodos de fusion de adaptadores: al ser un delta pequeno y bien delimitado (`q_proj`/`v_proj`, r=8), es un candidato comodo para experimentar con merge de LoRA en los pesos base y con comparativas entre modelo fusionado y modelo con adaptador en caliente.
- Analisis de deriva respecto al modelo base: util para cuantificar cuanto se desvia un DPO de bajo presupuesto del modelo de partida, dado que la propia model card reconoce que las salidas difieren solo ligeramente.
- Prototipado educativo con recursos minimos: sirve para que un estudiante o investigador sin acceso a GPUs de datacenter pruebe el ciclo completo de entrenamiento, publicacion en el Hub y carga mediante PEFT.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion, asesoramiento medico, legal o financiero, ni como componente de un agente autonomo. La model card lo restringe explicitamente a uso educativo y advierte sobre afirmaciones incorrectas emitidas con seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato numerico de rendimiento reportado es la perdida media de entrenamiento final (0,38), que no es comparable con metricas de evaluacion como MMLU, HumanEval o GSM8K. No se proporcionan resultados de evaluacion automatica ni comparaciones cuantitativas con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4 bits NF4, el peso del modelo ocupa del orden de 1 GB o algo menos, y el adaptador anade un fichero de pocos megabytes. La VRAM total depende de la longitud de contexto, el tamano de batch y el overhead de la libreria; no se publican cifras oficiales para este adaptador.
- GPU recomendadas: cualquier GPU con soporte de bitsandbytes. El propio autor uso una Colab T4. Para 4 bits son suficientes GPUs de 8-12 GB (RTX 3060, RTX 4060, RTX 3080). En bfloat16 sin cuantizar, el modelo base de 1,5 B ocupa varios gigabytes y cabe comodamente en 12-16 GB (RTX 4080, RTX 4090, A100, H100).
- Cabe en GPU de consumo: si, es uno de los puntos fuertes del artefacto. El ejemplo oficial usa cuantizacion 4 bits precisamente para reducir el consumo de VRAM.
- Opciones de despliegue: Transformers combinado con PEFT (`PeftModel.from_pretrained`), que es el metodo documentado. Tambien es viable cualquier servidor con soporte de adaptadores LoRA dinamicos, como vLLM, siempre que soporte Qwen2.5; no hay documentacion especifica del autor sobre vLLM, TGI, llama.cpp u Ollama. Para llama.cpp u Ollama habria que fusionar el adaptador con el modelo base y convertir el resultado a GGUF, tarea no documentada en el repositorio.
- Latencia y throughput estimados: no disponible. El unico dato de computo publicado es el tiempo de entrenamiento (aproximadamente 30 minutos en una Colab T4), que no es extrapolable a inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b | Adaptador LoRA sobre base de 1,5 B | No disponible (base declarada: 32.768 tokens) | Adaptador DPO sobre transformer denso | apache-2.0 | Publicado en HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | No disponible en esta ficha; la model card base declara 32.768 tokens | Transformer decoder-only denso ajustado por instrucciones | apache-2.0 | Ampliamente disponible en el Hub |
| Qwen/Qwen2.5-3B-Instruct | 3 B | No disponible en esta ficha | Transformer decoder-only denso ajustado por instrucciones | Qwen research/community segun variante | Disponible en el Hub |
| Meta Llama 3.2 1B Instruct | 1 B | No disponible en esta ficha | Transformer decoder-only denso ajustado por instrucciones | Licencia comunitaria de Llama | Disponible en el Hub |

No se dispone de datos de benchmarks que permitan comparar el rendimiento del adaptador frente a estas alternativas. La comparacion relevante es funcional: el adaptador no es un modelo autonomo, sino un delta de bajo rango que depende obligatoriamente de Qwen2.5-1.5B-Instruct y que, segun su propia model card, produce salidas muy proximas a las del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador esta entrenado sobre las preferencias de una unica persona, sobre 18 prompts y 378 pares. Cualquier sesgo de ese anotador y de esos prompts queda incorporado al adaptador, sin mecanismo de agregacion ni diversidad de anotadores.
- Riesgo de alucinacion: la model card advierte explicitamente de que el modelo puede afirmar informacion incorrecta con seguridad. El ajuste DPO no corrige este comportamiento y puede incluso reforzarlo si el anotador premio respuestas con tono seguro.
- Alcance del efecto: el propio autor reconoce que las salidas difieren solo ligeramente de las del modelo base, por lo que no debe esperarse una mejora medible ni un cambio de comportamiento sustancial.
- Limitaciones de idioma: solo se declara ingles (`en`). No hay soporte declarado para castellano ni para otros idiomas.
- Limitaciones de contexto: no hay cifras propias publicadas; la ventana efectiva seria la del modelo base.
- Restricciones de licencia: la licencia es apache-2.0, pero la model card indica uso exclusivamente educativo ("for educational use only"), lo que en la practica supone una restriccion de uso no alineada con la permisividad formal de apache-2.0 y debe revisarse antes de cualquier uso comercial. Ademas, el uso comercial arrastra las condiciones de licencia del modelo base Qwen2.5-1.5B-Instruct.
- Prohibicion de uso en decisiones de alto riesgo: la model card desaconseja explicitamente su uso para asesoramiento medico, legal o cualquier otro contexto de alto impacto.
- Madurez del artefacto: 0 descargas, 0 likes, repositorio de 0,0 GB, creado y actualizado en octubre de 2026. No hay evidencia de mantenimiento, versionado posterior ni evaluacion independiente.
- Dependencia de bitsandbytes: el ejemplo oficial asume carga en 4 bits NF4, lo que anade una dependencia de entorno y posibles diferencias numericas frente a la inferencia en bfloat16 completo.
- Ausencia total de datos de evaluacion: sin benchmarks, sin evaluacion de seguridad y sin comparativa cuantitativa con el modelo base, no es posible estimar ninguna mejora objetiva.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/leamhadzic/cs329x-hw1-dpo-qwen2.5-1.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset PRISM (prism-alignment): https://huggingface.co/datasets/HannahRoseKirk/prism-alignment
- Libreria PEFT: https://github.com/huggingface/peft
- Libreria TRL (mencionada en las etiquetas del modelo): https://github.com/huggingface/trl
- Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo. Los unicos resultados obtenidos fueron paginas sin relacion con el artefacto, por lo que no se incluyen. No se han encontrado papers, blogs, repositorios ni demos adicionales asociados al modelo.
