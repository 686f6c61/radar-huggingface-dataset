# mradermacher/Climb-1.2-Photon-i1-GGUF

## Resumen

Climb-1.2-Photon-i1-GGUF es una colección de cuantizaciones en formato GGUF del modelo Climb-1.2-Photon, publicada por el usuario mradermacher en Hugging Face. Se trata de una conversión de pesos (quantization-only) realizada con el pipeline habitual de este autor, que aplica cuantizaciones ponderadas con matriz de importancia (imatrix) sobre el modelo original alojado en el repositorio Climb-Ai/Climb-1.2-Photon. No es, por tanto, un modelo entrenado desde cero, sino una redistribución optimizada para inferencia local.

La información disponible sobre el modelo base es muy limitada. El repositorio no incluye pipeline declarado, licencia, idiomas ni model card más allá de los metadatos de la conversión. El dato de parámetros totales reportado en safetensors (481.182) es inconsistente con el nombre "1.2" del modelo y con el tamaño del repo (0.0 GB), por lo que no debe interpretarse como un recuento fiable de parámetros. Cualquier evaluación técnica del modelo debe remitirse al repositorio original del autor.

La relevancia de esta ficha radica en que permite localizar las cuantizaciones GGUF disponibles y conocer los formatos ofrecidos, pero no sustituye a la documentación del modelo base, que es la fuente autorizada para arquitectura, entrenamiento, licencia y capacidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el dato de safetensors, 481.182, no es coherente con el nombre del modelo ni con el tamaño del repo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small-IQ4_NL), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, IQ1_S, IQ1_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el modelo base se distribuye presumiblemente en safetensors, aunque no se confirma |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Climb-1.2-Photon: ni el repositorio de cuantizaciones ni los metadatos accesibles indican si se trata de un transformer denso, un MoE, un modelo híbrido o cualquier otra variante. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO o técnicas de alineación.

Lo único documentado en esta ficha es el proceso de conversión: cuantizaciones ponderadas con imatrix (weighted/imatrix quants) generadas con quantize_version 2 y convert_type hf, lo que indica que los pesos originales provienen de un checkpoint en formato Hugging Face y fueron convertidos al formato GGUF mediante las herramientas estándar de llama.cpp. El conjunto de cuantizaciones cubre un rango amplio, desde IQ1_S/IQ1_M (para entornos con memoria muy restringida) hasta Q6_K (para máxima fidelidad dentro de GGUF).

## Capacidades

- No se han documentado capacidades específicas del modelo base en la información disponible.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirma capacidad multilingüe ni lista de idiomas.
- No se confirma capacidad de visión, audio ni modo "thinking".
- La única capacidad verificable de este repositorio es la de servir pesos cuantizados en GGUF para inferencia con llama.cpp y herramientas compatibles.

## Casos de uso

- Inferencia local en CPU o GPU de gama baja: las cuantizaciones IQ1_S, IQ1_M e IQ2 permiten ejecutar el modelo en equipos con 4-8 GB de RAM/VRAM, a costa de una pérdida de calidad significativa.
- Despliegue en servidores sin GPU: al estar en GGUF, el modelo puede ejecutarse con llama.cpp en CPU, lo que facilita pruebas de concepto en infraestructura sin aceleradores.
- Evaluación comparativa de cuantizaciones: el amplio conjunto de variantes (de IQ1 a Q6_K) permite medir el impacto de la cuantización en la calidad de salida para este modelo concreto.
- Integración en aplicaciones de escritorio: herramientas como Ollama, LM Studio o KoboldCpp consumen GGUF directamente, lo que permite prototipar interfaces de chat locales.
- Pipelines de generación de texto offline: para entornos con requisitos de privacidad que impidan llamadas a APIs externas, una cuantización Q4_K_M o Q5_K_M ofrece un equilibrio razonable entre tamaño y fidelidad.
- Fine-tuning ligero sobre pesos cuantizados: algunas herramientas permiten adaptar modelos GGUF con LoRA, aunque el soporte depende del ecosistema y no está confirmado para este modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible con precisión, ya que se desconoce el número real de parámetros del modelo base. Como referencia orientativa, las cuantizaciones IQ1/IQ2 ocupan aproximadamente 1,5-3 bits por parámetro, Q4_K_M en torno a 4,5 bits por parámetro y Q6_K cerca de 6,5 bits por parámetro; el requisito exacto depende del tamaño real del modelo.
- GPU recomendadas: no disponible. La elección depende del tamaño del modelo base, que no se ha confirmado.
- Compatibilidad con GPU de consumo: no confirmada; dependerá del tamaño real del modelo y de la cuantización elegida.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que requerirían los pesos originales en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base (tamaño, arquitectura, contexto, licencia) para establecer una comparación rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La licencia no está declarada en este repositorio; antes de cualquier uso comercial debe consultarse la licencia del modelo original en Climb-Ai/Climb-1.2-Photon.
- El dato de parámetros totales (481.182) es incoherente con el nombre del modelo y con el tamaño del repositorio, por lo que no debe usarse para dimensionar infraestructura.
- Las cuantizaciones de baja precisión (IQ1_S, IQ1_M, IQ2_XXS) degradan notablemente la calidad de generación y pueden producir salidas incoherentes; no son adecuadas para producción.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Al ser una conversión de terceros, no existe garantía de que los pesos cuantizados reproduzcan fielmente el comportamiento del modelo original.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/Climb-1.2-Photon-i1-GGUF
- Modelo base: https://huggingface.co/Climb-Ai/Climb-1.2-Photon
