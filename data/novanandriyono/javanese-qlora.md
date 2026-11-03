# novanandriyono/javanese-qlora

## Resumen

`novanandriyono/javanese-qlora` es un adaptador LoRA (QLoRA) publicado en HuggingFace por el usuario novanandriyono, pensado para ajustar el modelo base `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, una variante de Gemma 3 de 4.000 millones de parametros en formato de 4 bits preparada por Unsloth. El adaptador se distribuye como pesos PEFT en safetensors y esta etiquetado como `text-generation` y `conversational`, lo que sugiere un uso orientado a dialogos. Por el nombre ("javanese") y las etiquetas, el objetivo declarado parece ser la adaptacion del modelo al idioma javanes, aunque la model card no aporta detalles sobre el corpus de entrenamiento ni sobre el rendimiento obtenido.

El artefacto es un adaptador, no un modelo completo: requiere cargar el modelo base y aplicar los pesos LoRA mediante la libreria `peft` o `transformers`. El repositorio ocupa aproximadamente 1,0 GB y cuenta con 21 descargas y 0 likes en el momento de la consulta, lo que indica un proyecto personal de baja difusion y sin validacion comunitaria. El acceso esta restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargarlo.

La relevancia de esta ficha es limitada pero ilustrativa: muestra el flujo tipico de fine-tuning QLoRA con Unsloth sobre un modelo pequeno de la familia Gemma 3 para una lengua de bajos recursos. No obstante, la ausencia de model card detallada, de licencia explicita, de idiomas declarados y de benchmarks hace que no sea recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only Gemma 3 (modelo base) |
| Parametros totales | no disponible (adaptador; el modelo base tiene 4.000 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Gemma 3 4B; no confirmada en la informacion) |
| Tipos de cuantizacion | modelo base en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | no disponibles (el nombre sugiere javanes, sin confirmacion documental) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base en formato compatible con `transformers`/`unsloth` |

## Arquitectura y entrenamiento

El adaptador se entrena sobre `unsloth/gemma-3-4b-it-unsloth-bnb-4bit`, una version del modelo instructivo Gemma 3 de 4.000 millones de parametros cuantizada a 4 bits y optimizada por Unsloth para reducir el consumo de memoria durante el ajuste. La tecnica QLoRA congela los pesos del modelo base cuantizados y entrena matrices de bajo rango (LoRA) en las capas de atencion y, presumiblemente, en las capas MLP, aunque la model card no especifica el rango, el alpha, el dropout ni las capas objetivo. Tampoco se documenta el numero de pasos, el tamano del dataset, la composicion del corpus ni si se aplicaron tecnicas de alineacion adicionales como DPO o RLHF.

No hay informacion sobre la innovacion tecnica del adaptador mas alla del uso de Unsloth y QLoRA. Se desconoce si se empleo enmascaramiento de tokens, empaquetado de secuencias o tecnicas de decodificacion especulativa durante el entrenamiento. La unica etiqueta tematica relevante es `arxiv:1910.09700`, que corresponde al articulo original de LoRA (Hu et al., 2021), no a un paper propio del adaptador.

## Capacidades

- Generacion de texto conversacional: el adaptador esta etiquetado como `conversational` y `text-generation`, por lo que se espera que mantenga el formato de chat del modelo base.
- Ajuste orientado al javanes: por el nombre del repositorio, se pretende mejorar el rendimiento en esa lengua, aunque no hay evaluacion publicada que lo confirme.
- Herencia de capacidades del modelo base: al ser un adaptador LoRA, conserva las capacidades de Gemma 3 4B IT (razonamiento basico, codigo, matematicas, multilingueismo), moduladas por el ajuste.
- Tool calling / function calling: no documentado en el adaptador; depende de si el modelo base lo soporta y de si el ajuste lo preserva.
- Agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el foco declarado es el javanes.
- Capacidades especiales (vision, audio, thinking mode): no documentadas; Gemma 3 4B IT es multimodal en vision, pero el adaptador no especifica si preserva esa capacidad.

## Casos de uso

- Prototipado de asistentes en javanes: cargar el adaptador sobre Gemma 3 4B IT en 4 bits y desplegar un chatbot de bajo coste para hablantes de javanes, aprovechando que el modelo base cabe en una GPU de consumo.
- Investigacion en lenguas de bajos recursos: usar el adaptador como punto de partida para experimentos de fine-tuning QLoRA sobre javanes, comparando con el modelo base sin ajustar.
- Generacion de contenido localizado: producir textos breves (descripciones, respuestas FAQ, resumenes) en javanes para sitios web o aplicaciones comunitarias, con revision humana obligatoria.
- Educacion y divulgacion: construir demos interactivas en Gradio o Streamlit que muestren el efecto del ajuste LoRA sobre un modelo pequeno, utiles en cursos de NLP.
- Evaluacion comparativa de adaptadores: servir como referencia en estudios sobre QLoRA con Unsloth, midiendo perplejidad o calidad percibida frente a otros adaptadores del mismo modelo base.
- Traduccion asistida experimental: emplear el adaptador como componente de un pipeline de traduccion javanes-espanol o javanes-ingles, siempre con validacion automatica y humana.
- Fine-tuning posterior: reutilizar el adaptador como inicializacion para nuevos ajustes sobre dominios especificos (legal, medico, turismo) en javanes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits ocupa aproximadamente 2,5-3 GB de pesos; con overhead de activaciones y cache KV, se estima un consumo de 4-6 GB para contextos moderados. El adaptador anade un coste minimo (decenas de MB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB, A100 40/80 GB, H100 80 GB. Cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar el modelo base cuantizado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (RTX 3060, RTX 4060, RTX 4070, RTX 4090).
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), `unsloth` (entrenamiento e inferencia optimizada), `vLLM` (con soporte de adaptadores LoRA), `llama.cpp`/`Ollama` solo si se fusiona el adaptador con el modelo base y se convierte a GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| novanandriyono/javanese-qlora | Adaptador sobre 4B | no disponible | no disponible | safetensors (PEFT) | Gated en HuggingFace |
| Gemma 3 4B IT (Google) | 4B | no disponible en esta ficha | Gemma Terms of Use | safetensors, GGUF | Publico en HuggingFace |
| Adaptadores QLoRA de la comunidad sobre Gemma 3 4B | 4B (base) | no disponible | variable | safetensors (PEFT) | Publicos, calidad variable |
| Modelos especializados en javanes (p. ej. variantes de Llama/Mistral ajustadas) | 7-8B tipicamente | no disponible | variable | safetensors, GGUF | Publicos |

La comparativa es cualitativa: no hay datos de rendimiento del adaptador que permitan una comparacion cuantitativa con alternativas. El modelo base Gemma 3 4B IT es la referencia natural, y cualquier adaptador comunitario de la misma familia requeriria evaluacion propia.

## Limitaciones y advertencias

- Ausencia de model card detallada: no se documentan datos de entrenamiento, hiperparametros, evaluacion ni limitaciones conocidas.
- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido; el modelo base Gemma 3 tiene sus propios terminos que deben respetarse.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que anade friccion para despliegues automatizados.
- Riesgo de alucinacion: inherente a los modelos de 4B; el ajuste LoRA no lo elimina y podria incrementarlo si el corpus de entrenamiento es pequeno o ruidoso.
- Sesgos: no documentados; los modelos Gemma heredan sesgos de sus datos de preentrenamiento, y el ajuste en javanes podria introducir sesgos adicionales no evaluados.
- Cobertura idiomatica incierta: no se confirma que el adaptador mejore el javanes ni que preserve el multilingueismo del modelo base.
- Capacidades del modelo base no garantizadas: tool calling, vision y razonamiento multi-paso pueden degradarse tras el ajuste.
- Baja validacion comunitaria: 21 descargas y 0 likes indican ausencia de revision por pares o uso extendido.
- No apto para produccion sin evaluacion propia: se recomienda medir perplejidad, calidad percibida y tasas de alucinacion antes de cualquier despliegue.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/novanandriyono/javanese-qlora
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it-unsloth-bnb-4bit
- Paper de LoRA (referenciado en las etiquetas): https://arxiv.org/abs/1910.09700
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- PEFT (libreria de adaptadores): https://github.com/huggingface/peft
- Gemma 3 (modelo base original): https://huggingface.co/google/gemma-3-4b-it
