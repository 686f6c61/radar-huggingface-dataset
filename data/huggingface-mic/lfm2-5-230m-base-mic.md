# huggingface-mic/LFM2.5-230M-Base-mic

## Resumen

LFM2.5-230M-Base-mic es un artefacto de prueba publicado por el usuario huggingface-mic bajo el identificador `huggingface-mic/LFM2.5-230M-Base-mic`. No se trata de un modelo utilizable: la propia model card lo describe explicitamente como un *fixture* de test, etiquetado con `test-artifact`, cuyo proposito es servir de banco de pruebas para la integracion de la familia LFM2 en el ecosistema Transformers. Deriva del checkpoint real `LiquidAI/LFM2.5-230M-Base`, del que copia byte a byte los ficheros de procesador (tokenizer, chat template, generation config y licencia) pero sustituye los pesos por valores aleatorios generados con semilla 17.

El repositorio contiene 4.272.672 parametros reales según los safetensors, muy por debajo de los 230M que sugiere el nombre del modelo base: la contraccion se aplico mediante una regla generica del script `sweep.py` del proyecto transformers-mic, reduciendo `num_hidden_layers` a 2. Los pesos se guardan en bfloat16, el dtype por defecto del checkpoint original, y se verifica que el forward, la loss y los gradientes son finitos en float32, bfloat16 y float16.

Su relevancia es instrumental, no funcional: permite a los mantenedores de Transformers validar contratos de API, expectativas de framework y rutas de ejecucion sin descargar el modelo completo. Cualquier uso generativo real produciria texto incoherente, ya que los pesos no han sido entrenados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lfm2ForCausalLM (transformer causal, configuracion reducida a 2 capas ocultas) |
| Parametros totales | 4.272.672 (fixture); el modelo base declara 230M en el nombre |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el fichero LICENSE se copia del modelo base, pero el campo de licencia del repo no esta declarado) |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El fixture reutiliza la clase `Lfm2ForCausalLM`, la implementacion de la familia LFM2 en Transformers, con la misma nomenclatura de tensores que el checkpoint real. La unica diferencia estructural es la reduccion de profundidad: `num_hidden_layers` pasa de la configuracion original a 2, aplicando la regla generica de contraccion del script `sweep.py` del repositorio transformers-mic. Los ficheros de procesador (`tokenizer.json`, `tokenizer_config.json`, `chat_template.jinja`, `generation_config.json`, `LICENSE`) se copian byte a byte desde `LiquidAI/LFM2.5-230M-Base`, de modo que el tokenizador y la plantilla de chat son identicos a los del modelo real.

No hay entrenamiento alguno. Los pesos son aleatorios con semilla 17 y se aceptaron tras superar una puerta de sensibilidad a la entrada: cada perturbacion de las entradas del contrato desplaza los logits al menos 0.001, siendo el caso mas debil `attention_mask:all_ones` con 0.0557. El `build.json` registra las fuentes fijadas, los resultados de las puertas y los hashes de ficheros, y la clave de fixture es `d63d0ee28710`, que cubre todo checkpoint cuyos ficheros de procesador sean identicos byte a byte y cuya config coincida tras la contraccion. El fixture es finito en float32, bfloat16 y float16 tanto en forward como en loss y gradientes.

## Capacidades

- Generacion de texto: tecnicamente ejecutable mediante `Lfm2ForCausalLM`, pero la salida es incoherente por construccion (pesos aleatorios).
- Validacion de contratos de API: comprueba que las entradas declaradas en `integration.json` producen variaciones de logits medibles.
- Verificacion de expectativas de framework: el directorio `integrations/transformers/expectations` recoge las salidas esperadas para el pipeline de Transformers.
- Pruebas de compatibilidad de tokenizer y chat template: al copiarse byte a byte del modelo real, permite validar el preprocesado sin descargar los 230M.
- Comprobacion de estabilidad numerica: forward, loss y gradientes finitos en float32, bfloat16 y float16.
- No dispone de tool calling, agentes, vision, audio ni modo thinking; la model card no declara ninguna de estas capacidades.

## Casos de uso

- CI de Transformers: ejecutar el fixture en cada pull request para verificar que `Lfm2ForCausalLM` sigue cargando y produciendo logits sensibles a las entradas, sin descargar el checkpoint completo de 230M.
- Validacion de contratos de integracion: usar `integration.json` y las expectativas de `integrations/transformers/expectations` para comprobar que cambios en la libreria no rompen la interfaz declarada.
- Pruebas de tokenizer y chat template: al ser ficheros identicos al modelo base, se puede validar el preprocesado multilingue y la plantilla de conversacion en un entorno ligero.
- Desarrollo de harnesses de evaluacion: probar codigo de evaluacion (perplejidad, generacion, metricas) contra un modelo de arquitectura real pero con pesos conocidos y reproducibles (semilla 17).
- Verificacion de estabilidad numerica en precisiones mixtas: comprobar que un pipeline en float16 o bfloat16 no produce NaN ni infinitos en forward, loss y gradientes.
- Reproducibilidad de artefactos: el `build.json` con hashes y fuentes fijadas permite auditar que el fixture corresponde exactamente al checkpoint cubierto.
- Formacion y demos: ilustrar la estructura de un repositorio de modelo con pesos, uso ejecutable y expectativas de framework en un unico lugar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un artefacto de test con pesos aleatorios, cualquier metrica de calidad (MMLU, HumanEval, GSM8K) seria invalida por definicion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (4.272.672 parametros equivalen a unos 8.5 MB de pesos); en float32, unos 17 MB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) e incluso CPU; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa con Transformers (`AutoModelForCausalLM`), ya que el fixture esta pensado para el pipeline de transformers-mic. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LFM2.5-230M-Base-mic (este) | 4.272.672 (fixture) | no disponible | Artefacto de test para integracion | no disponible | Hugging Face |
| LiquidAI/LFM2.5-230M-Base | 230M (segun nombre) | no disponible | Modelo base real de la familia LFM2 | no disponible | Hugging Face |
| Otros fixtures de transformers-mic | variable (contraidos) | no disponible | Artefactos de test por arquitectura | no disponible | Hugging Face |

La comparacion relevante es con el checkpoint original del que deriva: misma arquitectura y mismo procesador, pero 2 capas ocultas frente a la profundidad completa y pesos aleatorios frente a pesos entrenados. Frente a otros fixtures del proyecto, comparte la metodologia de contraccion generica y la puerta de sensibilidad a la entrada.

## Limitaciones y advertencias

- No es un modelo utilizable: la model card lo declara explicitamente como test artifact; la generacion de texto produce salidas incoherentes.
- Pesos aleatorios con semilla 17: no ha habido entrenamiento, por lo que no existe conocimiento factual ni capacidades linguisticas reales.
- Arquitectura truncada: 2 capas ocultas frente a la configuracion completa del modelo base, lo que invalida cualquier comparacion de rendimiento con el original.
- Licencia no declarada en el repositorio; el fichero LICENSE se copia del modelo base, pero el campo de licencia no esta cumplimentado, por lo que el uso comercial queda indeterminado.
- Idiomas y contexto no declarados: no se puede asumir ninguna cobertura multilingue ni ventana de contexto concreta.
- Riesgo de confusion: el nombre incluye "230M" pese a contener 4.3M parametros; debe tratarse siempre como fixture y nunca como candidato en busquedas de modelos.
- Sin soporte declarado para tool calling, agentes, vision ni audio.
- No apto para produccion en ningun escenario generativo; su unico uso legitimo es la validacion de integraciones y contratos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/huggingface-mic/LFM2.5-230M-Base-mic
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-230M-Base
- Manifest de contrato: integration.json (referenciado en la model card)
- Uso con Transformers: integrations/transformers/usage.md (referenciado en la model card)
- Expectativas de Transformers: integrations/transformers/expectations (referenciado en la model card)
- Procedencia del fixture: build.json (referenciado en la model card)
- Explicacion de la contraccion: https://huggingface-mic-mic-coverage.static.hf.space/shrink/LFM2.5-230M-Base-mic.html
- Script de contraccion: https://github.com/huggingface/transformers-mic/blob/main/experiments/sweep.py
- Script de construccion: https://github.com/huggingface/transformers-mic/blob/main/example/build_fixtures.py
- Repositorio transformers-mic: https://github.com/huggingface/transformers-mic
