# Skelletoon/lex-hopper-models

## Resumen

Lex Hopper models es un repositorio de modelos de traduccion automatica ingles-griego (y griego-ingles) derivados de los modelos OPUS-MT de Helsinki-NLP, empaquetados para su uso offline en la aplicacion movil Lex Hopper. El autor, Skelletoon, ha exportado los modelos originales `Helsinki-NLP/opus-mt-en-el` y `Helsinki-NLP/opus-mt-grk-en` a formato ONNX, ha reducido cada vocabulario a un solo idioma y ha cuantizado los pesos a 8 bits para que puedan ejecutarse en telefonos mediante ONNX Runtime.

Se trata, por tanto, de una redistribucion optimizada para despliegue en dispositivo, no de un modelo entrenado desde cero. La arquitectura subyacente es Marian, la empleada por OPUS-MT, con licencia Apache-2.0 y un tamano de repositorio de 0,2 GB. El interes practico esta en el pipeline de conversion: encoder y decoder fusionado con cache, vocabularios separados por lado (`source_vocab.json` y `target_vocab.json`), tokenizacion con SentencePiece (`source.spm`) y decodificacion voraz desde `decoder_start_token_id`.

Es relevante para desarrolladores que necesiten traduccion bidireccional en-griego en entornos sin conectividad o con recursos muy limitados, y como ejemplo de reduccion de modelos OPUS-MT para movil. No hay datos publicados de calidad de traduccion tras la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq tipo Marian (encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (pesos cuantizados, formato ONNX) |
| Idiomas soportados | ingles (en), griego (el) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (encoder + decoder fusionado con cache) |

## Arquitectura y entrenamiento

Los modelos originales son Marian NMT, una arquitectura transformer encoder-decoder desarrollada en el ecosistema OPUS-MT (Tiedemann y Thottingal, EAMT 2020). El autor no ha reentrenado los pesos: parte de los checkpoints publicados de Helsinki-NLP, en concreto `opus-mt-en-el` (commit `1653673`) para ingles-griego y `opus-mt-grk-en` (commit `b6bc948`) para griego-ingles.

Las modificaciones son de despliegue: exportacion a ONNX con encoder y decoder fusionado con cache de atencion, reduccion del vocabulario a un solo idioma por lado (el encoder usa `source_vocab.json` y el decoder `target_vocab.json`, con `</s>`, `<unk>` y `<pad>` mapeados a 0, 1 y 2 en ambos) y cuantizacion a 8 bits. La tokenizacion se realiza con `source.spm` y la decodificacion es voraz partiendo de `decoder_start_token_id` definido en `config.json`. No se documentan datos de entrenamiento, numero de tokens ni etapas de RLHF o DPO, ya que corresponden a los modelos base.

## Capacidades

- Traduccion automatica de texto ingles a griego y de griego a ingles.
- Ejecucion offline en dispositivos moviles mediante ONNX Runtime.
- Tokenizacion SentencePiece integrada mediante `source.spm`.
- Decodificacion voraz con cache de atencion en el decoder fusionado.
- Vocabularios reducidos por idioma para disminuir el tamano del modelo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta vision, audio ni modo de razonamiento extendido.
- Capacidad multilingue limitada exclusivamente al par en-el.

## Casos de uso

- Traduccion offline en aplicaciones moviles: el modelo esta disenado para descargarse en la app Lex Hopper y funcionar sin conexion, gracias a su formato ONNX cuantizado a 8 bits y su tamano reducido.
- Asistencia a viajeros en Grecia: traduccion de frases cotidianas ingles-griego en el telefono sin depender de red, util en zonas con cobertura limitada.
- Procesamiento por lotes de documentos bilingues: traduccion de correspondencia o formularios en-ingles en pipelines locales con ONNX Runtime, sin enviar datos a servicios externos.
- Integracion en aplicaciones de aprendizaje de idiomas: generacion de traducciones de referencia para ejercicios y vocabulario en el par en-el dentro de una app educativa.
- Prototipado de sistemas NMT en dispositivo: servir de base para experimentar con cuantizacion y exportacion ONNX de modelos Marian antes de escalar a otros pares de idiomas.
- Traduccion en entornos con requisitos de privacidad: al ejecutarse localmente, permite procesar texto sensible sin salida a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es muy reducida.
- GPU recomendadas: no requiere GPU; esta pensado para CPU movil con ONNX Runtime.
- Cabe en cualquier GPU de consumo e incluso en dispositivos moviles; no se especifican modelos concretos.
- Opciones de despliegue: ONNX Runtime (objetivo principal); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Skelletoon/lex-hopper-models | no disponible | no disponible | en, el | Apache-2.0 | ONNX 8 bits |
| Helsinki-NLP/opus-mt-en-el | no disponible | no disponible | en, el | Apache-2.0 | safetensors/PyTorch |
| Helsinki-NLP/opus-mt-grk-en | no disponible | no disponible | el, en | Apache-2.0 | safetensors/PyTorch |

La diferencia principal frente a los originales de Helsinki-NLP es el formato (ONNX cuantizado a 8 bits frente a PyTorch), el vocabulario reducido por lado y la orientacion a ejecucion en movil. No hay datos de calidad comparada tras la cuantizacion.

## Limitaciones y advertencias

- Al ser una cuantizacion a 8 bits de los modelos originales, puede producirse una perdida de calidad de traduccion no documentada.
- Solo cubre el par ingles-griego; no admite otros idiomas.
- No hay informacion sobre sesgos del modelo base ni evaluaciones especificas tras la conversion.
- Riesgo de alucinacion y de traducciones incorrectas en dominios especializados, comun en modelos NMT de este tamano.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda conservar la atribucion a Helsinki-NLP indicada por el autor.
- El repositorio no incluye datos de benchmarks ni de latencia; conviene validar la calidad en el caso de uso concreto antes de produccion.
- El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Skelletoon/lex-hopper-models
- Modelo base ingles-griego: https://huggingface.co/Helsinki-NLP/opus-mt-en-el
- Modelo base griego-ingles: https://huggingface.co/Helsinki-NLP/opus-mt-grk-en
- Paper OPUS-MT (Tiedemann y Thottingal, EAMT 2020): no disponible como enlace en la informacion proporcionada.
