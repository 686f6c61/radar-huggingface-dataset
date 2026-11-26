# RandumbPerson/Ling-3.2-Air-Tokenwing-GGUF

## Resumen

Ling-3.2-Air-Tokenwing-GGUF es una distribucion cuantizada del modelo Ling 3.2 Air, desarrollado originalmente por inclusionAI bajo licencia MIT. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) hibrido con atencion lineal, con 124.000 millones de parametros totales y 5.500 millones de parametros activos por token. La arquitectura combina 42 capas, de las cuales 35 emplean atencion lineal KDA (Kimi Delta Attention) y 7 usan MLA (Multi-head Latent Attention) con compuertas. El repositorio lo publica el usuario RandumbPerson como una conversion GGUF optimizada para motores tipo llama.cpp.

El interes de esta publicacion no reside en el modelo base, sino en las modificaciones aplicadas al fichero GGUF para hacerlo viable en hardware de consumo. El autor documenta dos intervenciones tecnicas concretas: la primera uniformiza la cuantizacion de todos los tensores de expertos (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`) a Q4_K, lo que permite activar el pool de expertos en VRAM de TokenWing; la segunda corrige un parche de 16 bytes en la cabecera GGUF que ajusta `rope.dimension_sections` de `[8,12,12,0]` a `[0,0,0,0]`, resolviendo un problema de bucles de repeticion en contextos largos.

El resultado medido en una RTX 5060 Ti de 16 GB es de aproximadamente 28-31 tok/s en decodificacion y 21-23 tok/s en procesamiento de prompt, frente a los 4 tok/s que ofrece una conversion Q4_K_M estandar con el pool de expertos desactivado. Es, por tanto, una ficha relevante para quienes quieran ejecutar un MoE de 124B en una GPU consumer, aunque con limitaciones claras de contexto y dependencia de sidecars propietarios del formato TokenWing.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion lineal (35 capas KDA + 7 capas MLA con compuertas) |
| Parametros totales | 124.000 millones |
| Parametros activos | 5.500 millones por token |
| Longitud de contexto | 4096 tokens por defecto en `run-optimized.cmd`; ampliable (verificado hasta 21k tokens tras el parche de RoPE) |
| Tipos de cuantizacion | Q4_K uniforme en todos los tensores de expertos (fichero principal); sidecars adicionales en formato binario propietario |
| Idiomas soportados | no disponible |
| Licencia | MIT (modelo base Ling 3.2 Air de inclusionAI); licencia del empaquetado GGUF no disponible |
| Formato de pesos | GGUF con blobs adicionales (TokenWing): `*.correction.bin`, `*.vram-experts.json`, `*.usage*.json`, `*.layer-order.json` |

## Arquitectura y entrenamiento

Ling 3.2 Air es un modelo MoE con 512 expertos enrutados, seleccion top-8 mas 1 experto compartido. La arquitectura hibrida alterna 35 capas con atencion lineal KDA y 7 capas con MLA con compuertas, un diseno que busca reducir el coste computacional del mecanismo de atencion en contextos largos manteniendo la calidad de representacion. Los detalles sobre el dataset de entrenamiento, el numero de tokens procesados y las tecnicas de alineacion (RLHF, DPO u otras) no estan disponibles en la informacion proporcionada.

La publicacion de RandumbPerson no modifica los pesos del modelo, sino el contenedor GGUF. La intervencion principal es la uniformizacion de la cuantizacion: el pool de expertos en VRAM de TokenWing mantiene `ffn_gate_exps` y `ffn_up_exps` en un unico tensor y se desactiva silenciosamente si sus tipos difieren. La conversion Q4_K_M estandar mezcla Q4_K en gate con Q6_K en up, lo que rompe esa condicion. El autor genera un Q4_K uniforme que preserva la funcionalidad del pool. La segunda intervencion es un parche de 16 bytes en el offset 2507 de la cabecera GGUF: los cuatro valores uint32 de `rope.dimension_sections` pasan de `[8,12,12,0]` a `[0,0,0,0]`, forzando al motor a usar la ruta NORM (solo texto) en lugar de NEOX. Segun el autor, el modelo espera rotacion de pares adyacentes y el desajuste provocaba repeticiones infinitas a partir de 5-15k tokens de contexto.

## Capacidades

- Generacion de texto y razonamiento general, heredadas del modelo base Ling 3.2 Air.
- Procesamiento de contexto largo tras el parche RoPE: verificado con un prompt de 21.000 tokens con parada natural y sin bucles de repeticion.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Inferencia con decodificacion optimizada mediante pool de expertos en VRAM, streaming de expertos desde SSD y planificacion de capas.

## Casos de uso

- Ejecucion local de un MoE de 124B en GPU consumer: con una RTX 5060 Ti de 16 GB y el preset de produccion, el modelo alcanza 28-31 tok/s en decodificacion, lo que permite usar un modelo de gran tamano en estaciones de trabajo sin GPU de datacenter.
- Asistentes conversacionales de contexto medio: el fichero arranca con `-c 4096`, suficiente para dialogos multi-turno, y puede ampliarse gracias al parche RoPE que evita los bucles de repeticion mas alla de 5-15k tokens.
- Procesamiento de documentos largos: con contexto ampliado a 21k tokens verificado, es adecuado para resumir o extraer informacion de articulos, informes o contratos de extension media.
- Prototipado de pipelines de agentes: al ejecutarse en `http://127.0.0.1:8080` con una API compatible con llama.cpp, se integra en frameworks de agentes que consuman endpoints OpenAI-compatibles, siempre que se validen las capacidades de tool calling del modelo base.
- Experimentacion con arquitecturas MoE hibridas: util para investigadores que quieran estudiar el comportamiento de atencion lineal KDA frente a MLA en un modelo de 124B sin acceso a hardware de datacenter.
- Evaluacion de tecnicas de offloading de expertos: el preset `--moe-stream-*` y las cinco variables `GGML_CUDA_*` documentadas sirven como referencia reproducible para medir el equilibrio entre VRAM, SSD y throughput en despliegues MoE.
- Inferencia por lotes pequenos en local: con sampling `--temp 1.0 --top-k 20 --top-p 0.95 --min-p 0`, adecuado para generacion de textos de 1.300 tokens como los usados en las mediciones del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor solo reporta mediciones de velocidad en una RTX 5060 Ti de 16 GB con respuestas de 1.300 tokens y 3 pares alternos:

| Configuracion | Decodificacion (tok/s) | Aciertos de pool en VRAM | Coste |
|---|---|---|---|
| Q4_K_M mixto estandar (pool desactivado) | 4,06 | 0 % | — |
| Q4_K uniforme, flags minimos | 14,13 | 35 % | — |
| + preset de produccion completo | 28,91 | 56,9 % | — |
| + 3 capas MoE completas en VRAM (final) | 30,77 | 68 % | Espera SSD +2,9 %, prompt sin cambios |

Otras configuraciones de capas completas resultaron peores: 0 capas daba +6,6 % de decodificacion pero +45 % de espera en SSD; 2 capas daba +12,9 % de decodificacion pero -6,7 % en prompt. El autor indica que los cambios de sampling afectan solo a la calidad de salida, no a la velocidad. El rendimiento global se describe como comparable a Ling 3.0 Flash, con 21-23 tok/s en procesamiento de prompt.

## Requisitos de hardware

- VRAM estimada: el autor reporta ejecucion funcional en 16 GB con 3 capas MoE completas residentes y el resto de expertos en streaming desde SSD. No se especifica la VRAM minima para otras configuraciones.
- GPU recomendadas: RTX 5060 Ti 16 GB es la unica medida documentada. Para configuraciones con mas capas residentes o mayor contexto se requeriria mas VRAM, aunque no se aportan cifras.
- Cabe en GPU consumer: si, al menos en RTX 5060 Ti 16 GB con el preset documentado.
- Almacenamiento: requiere SSD para el streaming de expertos; el autor mide el coste en espera de SSD como metrica de equilibrio.
- Opciones de despliegue: motor compatible con llama.cpp que soporte el formato TokenWing y los flags `--moe-stream-*`. El script `run-optimized.cmd` lanza el servidor en `http://127.0.0.1:8080`. No se mencionan vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 28-31 tok/s de decodificacion y 21-23 tok/s de prompt en la configuracion medida; 4 tok/s con conversion estandar.
- Dependencia de sidecars: el fichero GGUF debe acompanarse de `*.correction.bin`, `*.vram-experts.json`, `*.usage*.json` y `*.layer-order.json` en el mismo directorio.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.2-Air-Tokenwing-GGUF (esta ficha) | 124B / 5,5B | 4096 por defecto, 21k verificado | 28-31 tok/s decodificacion en RTX 5060 Ti 16 GB | MIT (base); empaquetado no disponible | Hugging Face (0 descargas) |
| Ling 3.0 Flash | no disponible | no disponible | Referencia de comparacion segun el autor, sin cifras | no disponible | no disponible |
| Conversion Q4_K_M estandar de Ling 3.2 Air | 124B / 5,5B | no disponible | 4,06 tok/s en la misma GPU (pool desactivado) | MIT (base) | Depende del conversor |

No se dispone de datos suficientes para comparar con alternativas de otros fabricantes en la misma categoria (MoE de ~100B con pocos parametros activos). La comparacion mas directa es con la conversion Q4_K_M estandar del mismo modelo base, donde la version TokenWing multiplica por aproximadamente 7,5 la velocidad de decodificacion.

## Limitaciones y advertencias

- Dependencia de un formato propietario: el fichero GGUF incorpora blobs y sidecars especificos de TokenWing; no es intercambiable con conversiones estandar ni con todos los motores llama.cpp.
- Fragilidad de la cuantizacion: si se regenera el GGUF con una mezcla Q4_K/Q6_K, el pool de expertos se desactiva y la decodificacion cae a ~4 tok/s.
- Parche manual de cabecera: la correccion de RoPE es un cambio de 16 bytes en el offset 2507; cualquier reprocesamiento del fichero que no preserve ese parche reintroduce los bucles de repeticion en contextos de 5-15k tokens.
- Contexto por defecto limitado: `-c 4096` deja poco margen para conversaciones largas; ampliarlo reduce la VRAM disponible para el pool de expertos y puede degradar el throughput.
- Rendimiento dependiente del almacenamiento: el streaming de expertos desde SSD introduce latencia; el autor mide un +2,9 % de espera con 3 capas residentes y hasta +45 % con 0 capas.
- Sin datos de calidad: no hay benchmarks publicados de MMLU, HumanEval, GSM8K ni evaluaciones de sesgo o alucinacion en la informacion disponible.
- Idiomas no documentados: se desconoce la cobertura linguistica real del modelo base en esta ficha.
- Licencia del empaquetado no disponible: aunque el modelo base es MIT, el autor no declara licencia para los ficheros GGUF ni para los sidecars.
- Repositorio sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; las mediciones proceden unicamente del autor.
- Uso comercial: la licencia MIT del modelo base permitiria uso comercial, pero conviene verificar los terminos del empaquetado y de las dependencias del motor antes de desplegar en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/RandumbPerson/Ling-3.2-Air-Tokenwing-GGUF
- Modelo base Ling 3.2 Air (inclusionAI): no disponible en la informacion proporcionada
- Paper, blog o repositorio de TokenWing: no disponible en la informacion proporcionada
- Documentacion de llama.cpp: no disponible en la informacion proporcionada
- Demo o espacio interactivo: no disponible en la informacion proporcionada
