# mradermacher/ShopMaster-4B-GGUF

## Resumen

ShopMaster-4B-GGUF es la version cuantizada en formato GGUF del modelo ShopMaster-4B, desarrollado originalmente por HOWILLMAKEIT y convertida por mradermacher. Se trata de un modelo especializado en agentes de compra (shopping agents) que combina capacidades de tool calling con entrenamiento mediante aprendizaje por refuerzo (RL), empleando tecnicas como GIGPO y DAPO sobre un simulador de tienda denominado ShopSimulator. El modelo esta etiquetado como basado en la arquitectura qwen3_5, lo que sugiere una adaptacion de la familia Qwen 3.5.

El modelo resuelve el problema de la automatizacion de tareas de compra y navegacion en entornos comerciales simulados, donde el agente debe interpretar instrucciones, invocar herramientas y completar transacciones de forma autonoma. Su entrenamiento con RL lo orienta especificamente hacia la toma de decisiones multi-paso en entornos con herramientas, mas que hacia la generacion de texto generalista.

Es relevante ahora porque los agentes de compra y los entornos simulados para entrenamiento con refuerzo estan cobrando interes como banco de pruebas para agentes LLM con tool calling. La ficha tecnica siguiente se basa exclusivamente en la informacion disponible en la model card y los metadatos de Hugging Face; muchos datos tecnicos no estan publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (etiquetado qwen3_5) |
| Parametros totales | 333.514.240 (segun safetensors); el nombre comercial indica "4B", discrepancia no aclarada en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, IQ4_XS; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se etiqueta con la arquitectura qwen3_5 y que su pipeline es de aprendizaje por refuerzo. El entrenamiento emplea GIGPO y DAPO, dos variantes de optimizacion de politica para RL, aplicadas sobre ShopSimulator, un entorno simulado de compra. No se detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de SFT o RLHF adicionales.

La model card del repositorio cuantizado es una plantilla generica de mradermacher y no aporta detalles sobre la arquitectura interna del modelo base. Los ficheros mmproj (multi-modal supplement) sugieren soporte de entrada multimodal, aunque la naturaleza exacta de esa modalidad no se especifica en la informacion proporcionada. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en chino e ingles.
- Tool calling / function calling, orientado a la invocacion de herramientas dentro de entornos de compra.
- Razonamiento multi-paso y comportamiento de agente, entrenado con RL sobre un simulador.
- Tareas de shopping agent: interpretacion de instrucciones de compra, navegacion y ejecucion de acciones en el entorno ShopSimulator.
- Soporte multimodal aparente (presencia de ficheros mmproj), aunque la modalidad concreta no esta documentada.
- Capacidades generales de razonamiento, codigo o matematicas: no documentadas en la informacion disponible.

## Casos de uso

- Automatizacion de compras en entornos simulados: el modelo puede actuar como agente que interpreta una peticion de compra y ejecuta la secuencia de acciones necesarias mediante tool calling, aprovechando su entrenamiento especifico con RL sobre ShopSimulator.
- Investigacion en aprendizaje por refuerzo para agentes: sirve como referencia de modelo entrenado con GIGPO y DAPO, util para comparar politicas de agente en entornos con herramientas.
- Desarrollo de asistentes de comercio electronico: integrable como motor de decision para flujos de busqueda de producto, seleccion y confirmacion, siempre que se valide su comportamiento fuera del simulador.
- Evaluacion de tool calling en pipelines de agentes: adecuado para probar frameworks de orquestacion de herramientas en escenarios acotados de compra.
- Despliegue ligero en local: al distribuirse en GGUF y con un tamano de repo de 1,0 GB, puede ejecutarse en hardware modesto para pruebas de integracion.
- Prototipado de agentes multilingues zh/en: util para experimentar con instrucciones en chino e ingles en tareas de compra.
- Banco de pruebas para decodificacion y cuantizacion: permite comparar la degradacion de calidad entre los distintos niveles de cuantizacion (Q2_K a Q8_0) en tareas de agente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamano del repo (1,0 GB) y los parametros declarados, las cuantizaciones bajas (Q2_K, Q3_K) caben en GPUs consumer con 4-6 GB, y las altas (Q8_0, f16) requieren aproximadamente 2-8 GB segun la discrepancia entre el nombre "4B" y los 333 M de parametros reportados.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 en adelante) deberia ser suficiente para las cuantizaciones pequenas.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de modelos actuales dada la cuantizacion GGUF.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) por el formato GGUF; vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. No disponible.

## Limitaciones y advertencias

- La model card del repositorio cuantizado es una plantilla generica; no documenta sesgos, datos de entrenamiento ni evaluaciones.
- Existe una discrepancia entre el nombre "4B" y los 333.514.240 parametros reportados en safetensors; conviene verificar el modelo base antes de usarlo en produccion.
- Riesgo de alucinacion no evaluado; no hay benchmarks publicados.
- El modelo esta especializado en shopping agents y simuladores; su comportamiento fuera de ese dominio no esta validado.
- Idiomas limitados a chino e ingles; no se declara soporte de castellano.
- Licencia apache-2.0, que permite uso comercial, pero el modelo base y sus dependencias deben verificarse por separado.
- Los ficheros mmproj sugieren multimodalidad, pero su funcionamiento no esta documentado.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en comunidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ShopMaster-4B-GGUF
- Modelo base: https://huggingface.co/HOWILLMAKEIT/ShopMaster-4B
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ShopMaster-4B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
