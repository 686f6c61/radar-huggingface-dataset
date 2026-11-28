# mradermacher/ChatVPet-qw35-9B-v1-GGUF

## Resumen

ChatVPet-qw35-9B-v1-GGUF es la distribucion en formato GGUF del modelo ChatVPet-qw35-9B-v1, desarrollado originalmente por LorisYounger y cuantizado por mradermacher. Se trata de un modelo conversacional afinado a partir de una base identificada como Qwen 3.5, con 9.197.093.888 parametros totales (aproximadamente 9,2 mil millones). Su orientacion es el rol de "vpet" (virtual pet o mascota virtual), es decir, un asistente conversacional de personaje, y esta etiquetado como compatible con endpoints.

La relevancia de esta publicacion es practica: el autor de las cuantizaciones, mradermacher, ofrece una bateria completa de variantes GGUF (desde Q2_K hasta f16, ademas de dos variantes mmproj para un componente multimodal), lo que permite ejecutar el modelo en hardware de consumo con llama.cpp u Ollama. El modelo base es de licencia Apache 2.0 y esta declarado unicamente para chino (zh).

Conviene senalar que la informacion publica disponible es escasa: la model card del repositorio GGUF no incluye detalles de arquitectura, contexto, datos de entrenamiento ni resultados de benchmarks. Esta ficha se limita a los datos verificables del repositorio y marca explicitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3_5 en los tags; transformer presumiblemente, sin confirmar) |
| Parametros totales | 9.197.093.888 (9,2 B) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); modelo base en formato transformers |
| Tamano del repositorio | 85,5 GB (incluye todas las variantes) |
| Modelo base | LorisYounger/ChatVPet-qw35-9B-v1 |
| Cuantizador | mradermacher |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El tag `qwen3_5` sugiere que el modelo base deriva de la familia Qwen 3.5, y el recuento de parametros (9,2 B) situa al modelo en la gama de 9 mil millones de parametros. El nombre "qw35" en el identificador es consistente con esa fila. No obstante, no consta confirmacion oficial sobre el tipo de atencion, el numero de capas, la longitud de contexto nativa ni si emplea tecnicas como atencion lineal o decodificacion especulativa.

Tampoco se documentan en la informacion disponible los datos de entrenamiento (numero de tokens, composicion del dataset) ni si el afinado incluyo RLHF, DPO u otras tecnicas de alineacion. El modelo esta etiquetado como `conversational` y `vpet`, lo que indica un ajuste orientado a dialogo de personaje. La presencia de ficheros `mmproj` (multi-modal supplement) en el repositorio GGUF apunta a que el modelo base incorpora o admite un componente multimodal, aunque no se detalla su naturaleza ni sus capacidades exactas.

## Capacidades

- Generacion de texto conversacional en chino, orientada a interacciones de personaje (rol de mascota virtual o "vpet").
- Soporte multimodal presumible: el repositorio incluye ficheros `mmproj` (Q8_0 y f16), lo que habilita el uso de un proyector multimodal en llama.cpp, aunque no se detalla que modalidades cubre.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse mediante infraestructura de inferencia estandar.
- No consta soporte documentado de tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidades multilingues limitadas: solo se declara chino (zh).
- No se documentan modos especiales como thinking mode, audio o vision mas alla del componente mmproj.

## Casos de uso

- Mascota virtual conversacional: el modelo esta afinado especificamente para el rol de "vpet", por lo que encaja en aplicaciones de compania digital, asistentes de escritorio o personajes interactivos con personalidad definida y conversacion multi-turno en chino.
- Prototipado de chatbots de personaje: gracias a las cuantizaciones Q4_K_M (5,9 GB) y Q5_K_M (6,8 GB), es posible desplegar un prototipo funcional en una GPU de consumo o incluso en CPU con llama.cpp, acelerando la iteracion sobre el guion del personaje.
- Integracion en aplicaciones de escritorio o moviles con llama.cpp: el formato GGUF y las variantes de baja cuantizacion (Q2_K de 4,1 GB, Q3_K_S de 4,5 GB) permiten embeber el modelo en entornos con recursos limitados.
- Experimentacion con modelos multimodales ligeros: los ficheros mmproj permiten probar pipelines de entrada multimodal en llama.cpp sin depender de infraestructura en la nube.
- Investigacion sobre alineacion de personajes: al ser un fine-tune conversacional de licencia Apache 2.0, sirve como caso de estudio para analizar como se comporta un modelo de 9 B ajustado a un rol concreto.
- Servicio de inferencia compatible con endpoints: el tag `endpoints_compatible` facilita su despliegue detras de una API compatible con OpenAI o similar para pruebas internas de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~4,1 GB
  - Q3_K_S: ~4,5 GB
  - Q3_K_M: ~4,9 GB
  - Q3_K_L: ~5,3 GB
  - IQ4_XS: ~5,5 GB
  - Q4_K_S: ~5,6 GB
  - Q4_K_M: ~5,9 GB
  - Q5_K_S: ~6,6 GB
  - Q5_K_M: ~6,8 GB
  - Q6_K: ~7,7 GB
  - Q8_0: ~9,9 GB
  - f16: ~18,5 GB
  - mmproj adicional: 0,7 GB (Q8_0) o 1,0 GB (f16)
- GPU recomendadas: no consta recomendacion oficial. Por tamano, una RTX 4090 (24 GB) aloja comodamente hasta f16; una RTX 3090 o 4080 (16-24 GB) cubre Q8_0 y todas las variantes inferiores.
- GPU de consumo: si. Las variantes Q4_K_M y Q5_K_M caben en GPUs de 8 GB (con margen ajustado para contexto), y las variantes Q3 y Q2 en GPUs de 6 GB. En CPU, las variantes Q4 funcionan con 8-16 GB de RAM.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). El modelo base en transformers puede servirse con vLLM o TGI, aunque la informacion disponible no confirma compatibilidad explicita.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ChatVPet-qw35-9B-v1 (este) | 9,2 B | no disponible | Apache 2.0 | GGUF / transformers | Fine-tune conversacional "vpet", solo chino |
| Qwen 2.5 7B Instruct | 7,6 B | 32K (tipico en la familia) | Apache 2.0 | GGUF / safetensors | Base generalista multilingue; no confirmado como ancestro directo |
| Llama 3.1 8B Instruct | 8,0 B | 128K | Llama 3.1 Community | GGUF / safetensors | Multilingue, uso comercial con restricciones de licencia |

La comparativa es orientativa: no se dispone de datos de benchmarks del modelo evaluado, por lo que no es posible comparar rendimiento numerico. La principal diferencia frente a alternativas generalistas es su especializacion en dialogo de personaje y su limitacion al chino.

## Limitaciones y advertencias

- Solo se declara soporte de chino (zh); el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- No se han publicado benchmarks, por lo que no hay evidencia publica de su calidad frente a alternativas.
- Riesgo de alucinacion inherente a los modelos de 9 B sin datos de alineacion documentados; mayor en tareas factuales.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad.
- El componente multimodal (mmproj) no esta descrito: se desconoce que modalidades soporta y con que calidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original (LorisYounger/ChatVPet-qw35-9B-v1) y de la familia Qwen subyacente.
- El repositorio pesa 85,5 GB por incluir todas las cuantizaciones; conviene descargar solo la variante necesaria.
- No consta soporte de tool calling ni de agentes; no debe asumirse para produccion sin validacion previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/ChatVPet-qw35-9B-v1-GGUF
- Modelo base: https://huggingface.co/LorisYounger/ChatVPet-qw35-9B-v1
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/ChatVPet-qw35-9B-v1-i1-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#ChatVPet-qw35-9B-v1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
