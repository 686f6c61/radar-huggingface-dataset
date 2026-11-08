# mradermacher/Llama_3.2_1B_Intruct_Tool_Calling_V2-GGUF

## Resumen

Llama_3.2_1B_Intruct_Tool_Calling_V2-GGUF es la versión cuantizada en formato GGUF del modelo nguyenthanhthuan/Llama_3.2_1B_Intruct_Tool_Calling_V2, un ajuste fino de Llama 3.2 1B orientado especificamente a tool calling (function calling). El modelo original parte de la familia Llama 3.2 de Meta y ha sido entrenado con el dataset nguyenthanhthuan/function-calling-sharegpt, con el objetivo de mejorar la capacidad del modelo base para emitir llamadas a funciones estructuradas en conversaciones.

La cuantización la firma mradermacher, un autor habitual en el ecosistema de cuantizaciones GGUF, que publica una bateria completa de variantes (Q2_K hasta f16) para facilitar el despliegue en hardware modesto. El modelo cuenta con 1.235.814.432 parametros totales (aproximadamente 1,2 mil millones), lo que lo situa en la categoria de modelos pequenos aptos para inferencia en CPU y GPU de consumo.

Su relevancia actual reside en la combinacion de tres factores: un tamano reducido que permite ejecucion local, una licencia Apache 2.0 permisiva para uso comercial y un enfasis explicito en tool calling, capacidad critica para construir agentes y pipelines de automatizacion ligeros sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Llama 3.2 1B; detalles especificos del ajuste no disponibles) |
| Parametros totales | 1.235.814.432 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 3.2 1B soporta 128k tokens, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en, vi |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Llama 3.2 1B de Meta, un transformer decoder-only con normalizacion RMSNorm y atencion por grupos (GQA) en su version original. El ajuste fino se ha realizado con el dataset nguyenthanhthuan/function-calling-sharegpt, orientado a ejemplos de function calling en formato ShareGPT, con el objetivo de ensenar al modelo a generar llamadas a herramientas de forma estructurada. En las etiquetas del repositorio aparecen las librerias unsloth y trl, lo que sugiere que el entrenamiento se llevo a cabo con el stack de Unsloth y TRL (probablemente SFT con LoRA o QLoRA, aunque el detalle exacto no se especifica en la informacion disponible).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases de RLHF o DPO. La cuantizacion GGUF la realiza mradermacher con quantize_version 2 y output_tensor_quantised 1, y se indica que no hay cuantizaciones ponderadas/imatrix disponibles en el momento de la publicacion. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles y vietnamita.
- Tool calling / function calling: capacidad principal del ajuste fino, orientada a emitir llamadas estructuradas a herramientas.
- Razonamiento multi-paso basico dentro de los limites de un modelo de 1,2B parametros.
- Integracion con pipelines de agentes ligeros mediante el formato de llamada a funciones.
- Soporte de inferencia en CPU y GPU de consumo gracias a las cuantizaciones GGUF.
- Compatibilidad con endpoints de Hugging Face (etiqueta endpoints_compatible) y con Ollama.
- Capacidades multilingues limitadas a los idiomas declarados (en, vi); no se garantiza un rendimiento solido en castellano.

## Casos de uso

- Agentes de automatizacion ligeros: el modelo puede emitir llamadas a funciones para orquestar APIs internas (consultas a bases de datos, envio de correos, operaciones CRUD) en entornos con recursos limitados, aprovechando su tamano de 1,2B parametros y su cuantizacion Q4_K_M de menos de 1 GB.
- Asistentes de atencion al cliente con tool calling: integrado en un backend que expone herramientas de consulta de pedidos o gestion de tickets, el modelo decide que funcion invocar y con que argumentos, reduciendo la necesidad de logica ad-hoc en el codigo.
- Prototipado rapido de pipelines de function calling: util para validar disenos de esquemas de herramientas y flujos de agente antes de migrar a modelos mayores, gracias a su baja latencia y facilidad de despliegue en local.
- Despliegue en dispositivos de borde: al caber en cuantizaciones de 0,7 a 1,4 GB, puede ejecutarse en mini-PC, Raspberry Pi de gama alta o portatiles sin GPU dedicada mediante llama.cpp u Ollama.
- Enrutamiento de intenciones en asistentes de voz o chat: el modelo puede clasificar la intencion del usuario y traducirla a una llamada de herramienta concreta en un pipeline de NLU ligero.
- Educacion y experimentacion: excelente punto de partida para investigadores que quieran estudiar el comportamiento de tool calling en modelos pequenos sin incurrir en costes de infraestructura.
- Automatizacion de tareas de soporte en vietnamita e ingles: el modelo declara soporte para estos dos idiomas, por lo que puede emplearse en flujos de atencion bilingues en esos mercados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7-1,0 GB en cuantizaciones Q2_K a Q5_K_M; 1,1 GB en Q6_K; 1,4 GB en Q8_0; 2,6 GB en f16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090 o superiores ofrecen margen sobrado. Tambien funciona en CPU.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama, text-generation-inference (etiqueta presente), transformers con soporte GGUF, y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia baja en GPU y aceptable en CPU, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama_3.2_1B_Intruct_Tool_Calling_V2-GGUF | 1,2B | no disponible | Apache 2.0 | GGUF | Ajuste especifico para tool calling, en/vietnamita |
| Llama 3.2 1B Instruct (Meta) | 1,2B | 128k (segun model card oficial de Meta, no verificada aqui) | Llama 3.2 Community License | safetensors, GGUF | Modelo base generalista; tool calling menos especializado |
| Qwen2.5 1.5B Instruct | 1,5B | 32k (segun model card oficial, no verificada aqui) | Apache 2.0 | safetensors, GGUF | Alternativa multilingue mas amplia y con tool calling nativo |
| SmolLM2 1.7B Instruct | 1,7B | 8k (segun model card oficial, no verificada aqui) | Apache 2.0 | safetensors, GGUF | Orientado a eficiencia en dispositivo, sin foco especifico en tool calling |

Los datos de contexto de los modelos comparados provienen de sus fichas oficiales y no se han verificado en esta busqueda; se indican como referencia orientativa.

## Limitaciones y advertencias

- Tamano reducido (1,2B parametros): capacidad de razonamiento y conocimiento factual limitada en comparacion con modelos de 7B o superiores; propenso a errores en tareas complejas.
- Riesgo de alucinacion: especialmente en la generacion de argumentos de funciones y en la seleccion de herramientas cuando el esquema no esta bien definido.
- Idiomas: solo se declaran ingles y vietnamita; el rendimiento en castellano no esta garantizado y probablemente sea deficiente.
- Contexto: no se confirma la longitud de contexto efectiva del ajuste fino; el modelo base soporta ventanas amplias, pero el ajuste puede degradar el comportamiento en contextos muy largos.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Llama 3.2, hereda los sesgos del modelo base y de los datos de ajuste.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las obligaciones de atribucion y las condiciones del modelo base Llama 3.2 de Meta, que pueden aplicar en cascada.
- Produccion: no se han publicado benchmarks ni evaluaciones de robustez; se recomienda validacion exhaustiva antes de desplegar en entornos criticos.
- Cuantizaciones: no hay versiones imatrix/ponderadas disponibles segun la model card, lo que puede afectar la calidad en cuantizaciones muy bajas (Q2_K, Q3_K_S).

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/Llama_3.2_1B_Intruct_Tool_Calling_V2-GGUF
- Arbol de archivos: https://huggingface.co/mradermacher/Llama_3.2_1B_Intruct_Tool_Calling_V2-GGUF/tree/main
- Modelo base original: https://huggingface.co/nguyenthanhthuan/Llama_3.2_1B_Intruct_Tool_Calling_V2
- Dataset de entrenamiento: https://huggingface.co/datasets/nguyenthanhthuan/function-calling-sharegpt
- Pagina de conveniencia del autor de cuantizaciones: https://hf.tst.eu/model#Llama_3.2_1B_Intruct_Tool_Calling_V2-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
