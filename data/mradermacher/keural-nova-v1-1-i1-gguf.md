# mradermacher/Keural-Nova-v1.1-i1-GGUF

## Resumen

Keural-Nova-v1.1 es un modelo de lenguaje instruido de tipo MoE (mixture of experts) con LoRA, desarrollado por hossain0909 y centrado en el idioma coreano junto con el inglés. El repositorio analizado aquí no es el modelo original, sino una cuantización en formato GGUF realizada por mradermacher, un cuantizador muy conocido en la comunidad de Hugging Face que publica versiones comprimidas con imatrix (matriz de importancia) para permitir la ejecución del modelo en hardware de consumo con llama.cpp, Ollama u otros runtimes compatibles con GGUF.

El modelo base pesa aproximadamente 35,5 mil millones de parámetros y se presenta como modelo conversacional con instrucción (instruction tuning), con soporte de visión según indica el cuantizador. Su relevancia radica en la escasez de modelos abiertos optimizados para coreano: Keural-Nova-v1.1 ofrece una alternativa con licencia Apache 2.0, lo que permite su uso comercial sin restricciones. La cuantización de mradermacher abarca desde versiones de ~13 GB (Q2_K) hasta ~29 GB (Q6_K), cubriendo un amplio rango de GPUs de consumo.

No se ha publicado información detallada sobre la arquitectura exacta, la longitud de contexto, los datos de entrenamiento ni benchmarks del modelo base en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con LoRA (mixture of experts, adapter LoRA sobre modelo base) |
| Parametros totales | 35.505.251.456 (~35,5 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | coreano (ko), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado con imatrix); modelo base en safetensors (~279,4 GB el repo cuantizado completo) |

## Arquitectura y entrenamiento

El modelo está etiquetado como MoE (mixture of experts) con LoRA, lo que sugiere que se trata de un modelo base al que se ha aplicado un adaptador LoRA para instruction tuning. El repositorio de safetensors indica un total de 35,5 mil millones de parámetros, aunque al ser MoE no se conoce el número de parámetros activos por token, dato que determinaría el coste real de inferencia. El cuantizador señala además que se trata de un modelo de visión, por lo que probablemente incorpora un proyector multimodal (los archivos mmproj se publican en el repositorio de cuantizaciones estáticas).

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, el proceso de post-entrenamiento (RLHF, DPO) ni las innovaciones técnicas concretas del modelo base. La cuantización de mradermacher emplea imatrix (matriz de importancia calculada sobre datos de calibración), técnica que mejora la calidad de las cuantizaciones bajas respecto a las cuantizaciones estáticas equivalentes.

## Capacidades

- Generación de texto conversacional con instruction tuning (etiqueta conversational).
- Soporte de idioma coreano e inglés.
- Capacidades de visión: el cuantizador indica que es un modelo de visión, con archivos mmproj disponibles en el repositorio de cuantizaciones estáticas.
- Etiquetado como MoE, lo que en teoría permite inferencia eficiente si solo se activan los expertos relevantes por token.
- No hay información publicada sobre tool calling, function calling, capacidades de agentes, razonamiento multi-paso ni modo de pensamiento extendido.

## Casos de uso

- Asistentes conversacionales en coreano: al estar instruido y centrado en coreano, es adecuado para chatbots y asistentes que deban responder de forma natural en ese idioma, algo donde los modelos generalistas suelen rendir por debajo de los especializados.
- Aplicaciones bilingües coreano-inglés: soporta ambos idiomas, útil para productos que atienden usuarios coreanos que mezclan términos técnicos en inglés.
- Despliegue local en hardware de consumo: las cuantizaciones GGUF permiten ejecutar el modelo en GPUs de gama alta o incluso en CPU con RAM suficiente, sin depender de APIs externas.
- Análisis de documentos e imágenes: al tratarse de un modelo de visión, podría emplearse para describir imágenes, extraer información de capturas o documentos en coreano, ejecutándose localmente (verificar compatibilidad del runtime con mmproj).
- Prototipado e investigación con licencia permisiva: Apache 2.0 permite integrarlo en productos comerciales, fine-tuning posterior y redistribución sin restricciones copyleft.
- Generación de contenido local y privado: al ejecutarse on-premise, es adecuado para flujos de trabajo con requisitos de privacidad de datos (salud, legal, interno corporativo) en contextos coreanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según la tabla de cuantizaciones):
  - i1-Q2_K: ~13,3 GB (cabe en una RTX 4090 de 24 GB con contexto amplio, o en una 3060 de 16 GB ajustado).
  - i1-Q3_K_S / IQ3_M: ~15,6-15,9 GB.
  - i1-Q4_K_S: ~20,5 GB; i1-Q4_K_M: ~21,8 GB (recomendada por el cuantizador): requieren GPU de 24 GB (RTX 3090, RTX 4090, RTX 5090).
  - i1-Q5_K_M: ~25,4 GB; i1-Q6_K: ~29,3 GB: requieren GPU de 32 GB (RTX 5090, A6000, L40S) o descarga parcial a CPU/RAM.
- GPUs recomendadas: RTX 4090 (24 GB) para Q4_K_M; RTX A6000, L40S o RTX 5090 para Q5/Q6; con offload a CPU, cualquier equipo con 32-64 GB de RAM puede ejecutar las cuantizaciones bajas.
- Consumer GPUs: sí, cabe en una RTX 4090 con la cuantización Q4_K_M (21,8 GB) y en GPUs de 16 GB con cuantizaciones Q2/Q3 de menor calidad.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, koboldcpp, y cualquier runtime compatible con GGUF. No es un GGUF orientado a vLLM/TGI (esos requieren pesos safetensors del modelo base).
- Latencia y throughput: no disponibles; al ser MoE de 35,5 B de parámetros totales, el rendimiento dependerá de los parámetros activos por token, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Licencia | Notas |
|---|---|---|---|---|
| Keural-Nova-v1.1 (esta cuantizacion) | ~35,5 B (MoE) | GGUF imatrix | Apache 2.0 | Especializado en coreano, vision |
| Qwen3-30B-A3B | 30,5 B (MoE, 3 B activos) | safetensors, GGUF comunitario | Apache 2.0 | Fuerte en coreano entre modelos abiertos, tool calling |
| Gemma 3 27B | 27 B (denso) | safetensors, GGUF comunitario | Gemma license (restricciones comerciales) | Multilingue incluido coreano, vision, 128k contexto |

Keural-Nova-v1.1 se sitúa en la franja de 27-35 B con especialización en coreano, frente a alternativas generalistas como Qwen3 o Gemma 3 que también cubren ese idioma. La ventaja diferencial sería el enfoque coreano y la licencia Apache 2.0 (frente a la licencia de Gemma), aunque sin benchmarks publicados no es posible afirmar que supere a las alternativas generalistas.

## Limitaciones y advertencias

- No hay benchmarks públicos ni model card detallada del modelo base, por lo que su calidad real (especialmente frente a Qwen3 o Gemma 3 en coreano) es difícil de verificar de forma independiente.
- El número de parámetros activos del MoE no está publicado, lo que impide estimar con precisión el coste de inferencia y el rendimiento.
- El proyecto es de autoría individual (hossain0909) sin documentación técnica publicada conocida, lo que supone un riesgo mayor de alucinaciones, sesgos no caracterizados y comportamiento impredecible que en modelos de laboratorios grandes.
- Soporte de idiomas limitado a coreano e inglés; el rendimiento en castellano u otros idiomas es desconocido y probablemente pobre.
- La longitud de contexto no está documentada: antes de producción, verificar empíricamente cuánto contexto maneja sin degradación.
- El soporte de visión en GGUF depende de los archivos mmproj publicados en el repositorio estático y de que el runtime empleado los soporte.
- Licencia Apache 2.0: sin restricciones comerciales, pero el modelo base hereda cualquier limitación de sus datos de entrenamiento, que no están documentados.
- Cuantizaciones Q2_K y Q4_0 tienen pérdida de calidad notable según el propio cuantizador; usar IQ3_S o superior para resultados razonables.

## Enlaces

- Repositorio cuantizado (imatrix): https://huggingface.co/mradermacher/Keural-Nova-v1.1-i1-GGUF
- Repositorio cuantizado estatico: https://huggingface.co/mradermacher/Keural-Nova-v1.1-GGUF
- Modelo base: https://huggingface.co/hossain0909/Keural-Nova-v1.1
- Pagina de descargas resumida: https://hf.tst.eu/model#Keural-Nova-v1.1-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Notas sobre calidad de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
