# sivelsguy/opus-mt-fr-he-onnx

## Resumen

`opus-mt-fr-he-onnx` es una exportación a ONNX con cuantización dinámica de 8 bits del modelo de traducción automática `Helsinki-NLP/opus-mt-fr-he`, desarrollado originalmente por el grupo Language Technology de la Universidad de Helsinki dentro del proyecto OPUS-MT. El modelo traduce texto del francés al hebreo y ha sido empaquetado por el usuario `sivelsguy` para su uso directo en el navegador mediante transformers.js, con un tamaño de repositorio de 0,1 GB.

La relevancia de esta ficha radica en su formato de despliegue: al estar exportado a ONNX e incluir un `tokenizer.json`, permite ejecutar traducción neuronal en el cliente (navegador o Node.js) sin necesidad de infraestructura de servidor ni GPU. Está pensado para aplicaciones web ligeras, como demuestra su uso en la aplicación de aprendizaje de hebreo *Parle*.

Arquitectura Marian (transformer encoder-decoder), licencia Apache-2.0 y soporte exclusivo para el par de idiomas francés-hebreo. No se dispone de información pública sobre el número exacto de parámetros en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 dinámica (ONNX q8) |
| Idiomas soportados | francés (fr), hebreo (he) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con tokenizer.json) |

## Arquitectura y entrenamiento

El modelo base `Helsinki-NLP/opus-mt-fr-he` emplea la arquitectura Marian, un transformer encoder-decoder diseñado específicamente para traducción automática neuronal y entrenado sobre corpus paralelos del proyecto OPUS. La exportación aquí presentada aplica cuantización dinámica de 8 bits sobre los pesos ONNX, lo que reduce el tamaño y acelera la inferencia en CPU, a costa de una posible pérdida menor de calidad en la traducción.

No se dispone de información detallada en la documentación proporcionada sobre el número de tokens de entrenamiento, la composición exacta del dataset paralelo ni si se aplicaron técnicas de ajuste fino adicionales como RLHF o DPO. El modelo original se distribuye bajo licencia Apache-2.0 y sigue el esquema estándar de OPUS-MT para pares de idiomas de bajos recursos.

## Capacidades

- Traducción de texto del francés al hebreo, una frase por llamada.
- Ejecución en navegador mediante transformers.js con el pipeline `translation` y `dtype: "q8"`.
- Inferencia en CPU sin necesidad de GPU, gracias a la cuantización int8.
- Integración sencilla en aplicaciones web JavaScript/TypeScript.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada exclusivamente al par fr-he.

## Casos de uso

- Aplicaciones de aprendizaje de idiomas: integración en apps web como *Parle* para traducir frases del francés al hebreo en tiempo real en el navegador, sin backend.
- Traducción de contenido editorial francés a hebreo: artículos, notas o documentación que puedan procesarse frase a frase en un cliente ligero.
- Herramientas de accesibilidad en sitios web: traducción bajo demanda de fragmentos de interfaz para usuarios hebreoparlantes que consultan contenido en francés.
- Extensiones de navegador: traducción de selecciones de texto en páginas web francesas directamente en el cliente, preservando la privacidad del contenido.
- Prototipado rápido de pipelines de traducción: validación de flujos fr-he en entornos de desarrollo sin infraestructura de servidor.
- Aplicaciones offline o de bajo consumo: despliegue en dispositivos con recursos limitados donde no es viable ejecutar modelos de mayor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para ejecución en CPU; en GPU, el modelo cuantizado a int8 ocupa aproximadamente 0,1 GB, por lo que cabría en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) puede ejecutarlo sobradamente.
- Cabe en cualquier GPU consumer e incluso en dispositivos móviles y navegadores modernos.
- Opciones de despliegue: transformers.js (navegador y Node.js), ONNX Runtime; también podría ejecutarse con llama.cpp u Ollama solo si se convirtiera a GGUF, lo cual no está documentado.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo pequeño cuantizado, se espera latencia de decenas de milisegundos por frase en CPU moderna, aunque no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| sivelsguy/opus-mt-fr-he-onnx | no disponible | no disponible | fr-he | Apache-2.0 | ONNX int8 |
| Helsinki-NLP/opus-mt-fr-he | no disponible | no disponible | fr-he | Apache-2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-fr-mul | no disponible | no disponible | fr-multilingüe | Apache-2.0 | safetensors/PyTorch |
| Facebook NLLB-200-distilled-600M | 600M | 512 tokens | 200 idiomas | CC-BY-NC-4.0 | safetensors/PyTorch |

La principal ventaja diferencial de esta exportación es su formato ONNX int8 listo para transformers.js, que permite ejecución en navegador; los modelos comparables requieren infraestructura de servidor o conversión adicional. NLLB ofrece mayor cobertura idiomática pero con licencia no comercial y mayor tamaño.

## Limitaciones y advertencias

- Solo traduce una frase por llamada; las entradas por lotes de distinta longitud pueden producir puntuación repetida al final.
- El par de idiomas es exclusivamente francés-hebreo; no admite otros idiomas.
- La cuantización int8 puede degradar ligeramente la calidad respecto al modelo original en fp32.
- Riesgo de alucinación y errores en frases ambiguas, terminología especializada o texto con mucho ruido, como es habitual en modelos de traducción neuronal.
- Sesgos potenciales heredados de los corpus OPUS, que pueden reflejar desequilibrios de género, dominio o registro.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- No apta para traducción de documentos largos sin segmentación previa.
- Sin garantías de mantenimiento ni soporte por parte del autor de la exportación.

## Enlaces

- [Hugging Face: sivelsguy/opus-mt-fr-he-onnx](https://huggingface.co/sivelsguy/opus-mt-fr-he-onnx)
- [Modelo base: Helsinki-NLP/opus-mt-fr-he](https://huggingface.co/Helsinki-NLP/opus-mt-fr-he)
- [Proyecto OPUS-MT](https://github.com/Helsinki-NLP/OPUS-MT)
- [transformers.js](https://github.com/huggingface/transformers.js)
